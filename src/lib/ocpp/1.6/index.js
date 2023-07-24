import { Connection } from '../connection';
import { sleep } from 'utils/csv';
import { ChargeState } from '../charge';
import { getConfigurationItem } from '../../settings';

export default class ChargingStation {
  constructor(configuration, options = {}) {
    this.configuration = configuration;
    this.options = options;
    this.sessions = {};
    this.numConnectionAttempts = 0;
    this.currentStatus = {
      '1': 'Available',
      '2': 'Available',
    };
  }

  availableConnectors() {
    return ['1', '2'].filter((id) => !this.sessions[id]);
  }

  connect() {
    const ocppBaseUrl = this.options.ocppBaseUrl;
    const ocppIdentity = this.configuration['identity'];
    this.log('message', `> Connecting to ${ocppBaseUrl}/${ocppIdentity} with OCPP protocol 1.6`);
    this.connection = new Connection(ocppBaseUrl, ocppIdentity, 'ocpp1.6');
    this.connection.onConnected = () => {
      this.connected = true;
      this.log('message-response', '< Connected!');
      this.startHeartbeat();
      setTimeout(() => {
        this.sendBootNotification();
      }, 2000);
    };
    this.connection.onError = (error) => {
      if (!this.connected) {
        return;
      }
      this.log('error', error.message);
      this.disconnect();
      this.reconnect();
    };
    this.connection.onCommand = (method, params) => {
      let response = {};
      if (this['receive' + method]) {
        response = this['receive' + method](params);
      } else {
        console.warn(
          `Received command from Central Server, but no implementation is known: ${method}`
        );
      }
      this.log('command', `received ${method} command`, {
        destination: 'charge-point',
        requestReceivedAt: new Date(),
        request: { method, params },
        response,
        responseSentAt: new Date(),
        subprotocol: 'ocpp1.6',
      });
      return response;
    };
    this.connection.connect();
    this.numConnectionAttempts++;
  }

  disconnect() {
    this.stopHeartbeat();
    this.connection.disconnect();
    this.log('message', '> Disconnected');
    this.connected = false;
  }

  reconnect() {
    if (this.numConnectionAttempts > 100) {
      this.log('error', 'Too many connection attempts, giving up');
      return;
    }
    const numSeconds = this.numConnectionAttempts < 5 ? 5 : 30;
    this.log('message', `> Reconnecting in ${numSeconds} seconds`);
    setTimeout(() => {
      this.connection.connect();
      this.numConnectionAttempts++;
    }, numSeconds * 1000);
  }

  async powerOff() {
    for (const session of Object.values(this.sessions)) {
      await session.stop();
    }
    await this.disconnect();
  }

  async startSession(connectorId, session) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to OCPP server, cannot start session');
      }
      this.sessions[connectorId] = new Session(connectorId, {
        ...session,
        sendCommand: this.sendCommand.bind(this),
        meterValuesInterval: parseInt(
          this.configuration['meter-value-sample-interval'] || '60',
          10
        ),
        getCurrentStatus: () => this.currentStatus[connectorId],
      });
      this.sessions[connectorId].isStartingSession = true;
      await this.sessions[connectorId].start();
      this.sessions[connectorId].isStartingSession = false;
      this.onSessionStart && this.onSessionStart(connectorId);
    } catch (error) {
      this.sessions[connectorId].isStartingSession = false;
      await this.stopSession(connectorId);
      this.error(error);
    }
  }

  async sendStatusNotification(connectorId, status) {
    if (!this.sessions[connectorId]) {
      return;
    }
    await this.sendCommand('StatusNotification', {
      connectorId,
      timestamp: new Date().toISOString(),
      errorCode: 'NoError',
      status: status,
    });
  }

  async stopSession(connectorId, statusFn) {
    try {
      if (this.sessions[connectorId]) {
        this.sessions[connectorId].isStoppingSession = true;
        statusFn && statusFn();
        await this.sessions[connectorId].stop();
      }
      delete this.sessions[connectorId];
    } catch (error) {
      this.error(error);
    }
  }

  hasRunningSession(connectorId) {
    return !!this.sessions[connectorId];
  }

  isStartingSession(connectorId) {
    return (
      this.sessions[connectorId] && this.sessions[connectorId].isStartingSession
    );
  }

  isStoppingSession(connectorId) {
    return (
      this.sessions[connectorId] && this.sessions[connectorId].isStoppingSession
    );
  }

  // Private

  error(error) {
    this.onError && this.onError(error);
  }

  log(type, message, command = undefined) {
    const id = `${Date.now()}-${Math.random()}}`;
    this.onLog && this.onLog({ id, type, message, command });
  }

  startHeartbeat() {
    this.sendCommand('Heartbeat', {});
    this.heartbeatInterval = setInterval(() => {
      this.sendCommand('Heartbeat', {});
    }, parseInt(this.configuration['heartbeat-interval'] || '30', 10) * 1000);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
  }

  async sendBootNotification() {
    await this.sendCommand('BootNotification', {
      chargePointVendor: this.options.chargePointVendor,
      chargePointModel: this.options.chargePointModel,
      chargePointSerialNumber: this.options.chargePointSerialNumber,
      chargeBoxSerialNumber: this.configuration['identity'],
      firmwareVersion: 'v1-000',
      iccid: this.options.iccid,
      imsi: this.options.imsi,
    });
    await sleep(200);
    await this.sendCommand('StatusNotification', {
      connectorId: 1,
      errorCode: 'NoError',
      status: 'Available',
    });
    await sleep(200);
    await this.sendCommand('StatusNotification', {
      connectorId: 2,
      errorCode: 'NoError',
      status: 'Available',
    });
  }

  async sendCommand(method, params) {
    const requestSentAt = new Date();
    const response = await this.connection.sendCommand(method, params);
    this.log('command', `sent ${method} command`, {
      destination: 'central-server',
      requestSentAt,
      request: { method, params },
      response,
      responseReceivedAt: new Date(),
      subprotocol: 'ocpp1.6',
    });
    if (method === 'StatusNotification' && params.status && params.connectorId) {
      this.currentStatus[params.connectorId] = params.status;
    }
    return response;
  }

  receiveGetConfiguration() {
    const results = [];
    for (const [key, value] of Object.entries(this.configuration)) {
      const item = getConfigurationItem(key);
      if (!('1.6' in item.name)) {
        continue;
      }
      results.push({
        key: item.name['1.6'],
        value,
        readOnly: item.mutability === 'ReadOnly',
      });
    }
    return {
      configurationKey: results,
      unknownKey: [],
    };
  }

  receiveChangeConfiguration({ key, value }) {
    this.configuration[key] = value;
    return {
      status: 'Accepted',
    };
  }

  receiveRemoteStartTransaction({ connectorId, idTag }) {
    if (this.hasRunningSession(connectorId.toString())) {
      return {
        status: 'Rejected',
      };
    }
    setTimeout(() => {
      this.startSession(connectorId.toString(), {
        uid: idTag,
      });
    }, 100);
    return {
      status: 'Accepted',
    };
  }

  receiveRemoteStopTransaction({ transactionId }) {
    let connectorId;
    ['1', '2'].forEach((cId) => {
      if (
        this.sessions[cId] &&
        this.sessions[cId].transactionId === transactionId
      ) {
        connectorId = cId.toString();
      }
    });
    if (!connectorId || !this.hasRunningSession(connectorId)) {
      return {
        status: 'Rejected',
      };
    }
    setTimeout(() => {
      this.stopSession(connectorId);
    }, 100);
    return {
      status: 'Accepted',
    };
  }
}

class Session {
  constructor(connectorId, options = {}) {
    this.connectorId = parseInt(connectorId, 10);
    this.options = options;
    this.meterValuesInterval = options.meterValuesInterval || 60;
    this.charge = new ChargeState(options);
    this.started = false;
  }

  now() {
    return new Date();
  }

  async start() {
    await sleep(1000);
    const authorizeResponse = await this.options.sendCommand('Authorize', {
      idTag: this.options.uid,
    });
    if (authorizeResponse.idTagInfo.status === 'Invalid') {
      throw new Error(
        `OCPP Server rejected our Token UID during Authorize: ${this.options.uid}`
      );
    }
    await sleep(1000);
    const startTransactionResponse = await this.options.sendCommand(
      'StartTransaction',
      {
        connectorId: this.connectorId,
        idTag: this.options.uid,
        meterStart: Math.round(this.charge.kwhElapsed * 1000),
        timestamp: this.now().toISOString(),
        reservationId: undefined,
      }
    );
    await sleep(1000);
    if (startTransactionResponse.idTagInfo.status === 'Invalid') {
      throw new Error(
        `OCPP Server rejected our Token UID during StartTransaction: ${this.options.uid}`
      );
    }

    if (startTransactionResponse.idTagInfo.status === 'ConcurrentTx') {
      throw new Error(
        `OCPP Server did not start transaction due to ConcurrentTx: ${this.options.uid}`
      );
    }

    this.started = true;
    this.transactionId = startTransactionResponse.transactionId;

    await this.options.sendCommand('StatusNotification', {
      connectorId: this.connectorId,
      errorCode: 'NoError',
      status: 'Preparing',
    });
    this.tickInterval = setInterval(() => {
      this.tick(5);
    }, 5000);
    await sleep(500);
    this.tick(0);
  }

  async stop() {
    clearInterval(this.tickInterval);
    if (this.started) {
      await sleep(1000);
      await this.options.sendCommand('StopTransaction', {
        connectorId: this.connectorId,
        idTag: this.options.uid,
        meterStop: Math.round(this.charge.kwhElapsed * 1000),
        timestamp: this.now().toISOString(),
        disconnectReason: 'EVDisconnected',
        transactionId: this.transactionId,
        transactionData: [
          {
            sampledValue: [
              {
                value: this.charge.kwhElapsed.toString(),
                context: 'Sample.Periodic',
                format: 'Raw',
                measurand: 'Energy.Active.Import.Register',
                location: 'Outlet',
                unit: 'kWh',
              },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }
    await sleep(1000);
    await this.options.sendCommand('StatusNotification', {
      connectorId: this.connectorId,
      errorCode: 'NoError',
      status: 'Available',
    });
  }

  async tick(secondsElapsed) {
    if (secondsElapsed === 0) {
      await this.options.sendCommand('StatusNotification', {
        connectorId: this.connectorId,
        errorCode: 'NoError',
        status: 'Charging',
        info: 'Charging',
      });
      return;
    }

    if (
      this.charge.lastMeterValuesTimestamp &&
      this.charge.lastMeterValuesTimestamp >
      this.now() - this.meterValuesInterval * 1000
    ) {
      return;
    }

    const chargeLimitWasReached = this.charge.chargeLimitReached;
    this.charge.progress(this.options.getCurrentStatus() === 'Charging', secondsElapsed);

    if (!chargeLimitWasReached && this.charge.chargeLimitReached) {
      await this.options.sendCommand('StatusNotification', {
        connectorId: this.connectorId,
        errorCode: 'NoError',
        status: 'SuspendedEV',
      });
    }
    await sleep(100);
    await this.options.sendCommand('MeterValues', {
      connectorId: this.connectorId,
      transactionId: this.transactionId,
      meterValue: [
        {
          timestamp: this.now().toISOString(),
          sampledValue: [
            {
              value: this.charge.kwhElapsed.toFixed(5),
              context: 'Sample.Periodic',
              measurand: 'Energy.Active.Import.Register',
              location: 'Outlet',
              unit: 'kWh',
            },
          ],
        },
      ],
    });
  }
}

