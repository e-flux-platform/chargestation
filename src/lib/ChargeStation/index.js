import { extractOcppBaseUrlFromConfiguration } from './utils';
import { Connection } from '../protocols/ocpp-1.6';
import { sleep } from 'utils/csv';

export default class ChargeStation {
  constructor(configuration, options = {}) {
    this.configuration = configuration;
    this.options = options;
    this.sessions = {};
  }
  availableConnectors() {
    return ['1', '2'].filter((id) => !this.sessions[id]);
  }
  connect() {
    const ocppBaseUrl =
      extractOcppBaseUrlFromConfiguration(this.configuration) ||
      this.options.ocppBaseUrl;
    const ocppIdentity = this.configuration['Identity'];
    this.log('message', `> Connecting to ${ocppBaseUrl}/${ocppIdentity}`);
    this.connection = new Connection(ocppBaseUrl, ocppIdentity);
    this.connection.onConnected = () => {
      this.connected = true;
      this.log('message-response', '< Connected!');
      this.startHeartbeat();
      setTimeout(() => {
        this.sendBootNotification();
      }, 2000);
    };
    this.connection.onError = (error) => {
      this.log('error', error.message);
      this.stopHeartbeat();
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
      });
      return response;
    };
    this.connection.connect();
  }
  disconnect() {
    this.connection.disconnect();
    this.stopHeartbeat();
    this.connected = false;
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
          this.configuration['MeterValueSampleInterval'] || '60',
          10
        ),
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
    this.onLog && this.onLog({ id: Date.now(), type, message, command });
  }

  startHeartbeat() {
    this.sendCommand('Heartbeat', {});
    this.heartbeatInterval = setInterval(() => {
      this.sendCommand('Heartbeat', {});
    }, parseInt(this.configuration['HeartbeatInterval'] || '30', 10) * 1000);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
  }

  async sendBootNotification() {
    await this.sendCommand('BootNotification', {
      chargePointVendor: this.options.chargePointVendor,
      chargePointModel: this.options.chargePointModel,
      chargePointSerialNumber: this.options.chargePointSerialNumber,
      chargeBoxSerialNumber: this.configuration.Identity,
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
    });
    return response;
  }

  receiveGetConfiguration() {
    return {
      configurationKey: Object.keys(this.configuration).map((key) => {
        return {
          key,
          value: this.configuration[key],
          readOnly: false,
        };
      }),
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

/*

64kwh car battery:

Type Of Charger	Speed	Range Added Per Hour	Charging Time
8 Amp Portable Charger	1.8kW	10km	35 hours
AC Charger Single-phase	7.4kW	40km	9 hours
AC Charger Three-phase	22kW	120km	3 hours
DC Charger Medium	25kW	150km	1.5 hours (to 80%)
DC Rapid Charger	50kW	300km	1 hour (to 80%)
DC Ultra Rapid Charger	175kW	1000km	15 minutes (to 80%)
*/
class Session {
  constructor(connectorId, options = {}) {
    this.connectorId = parseInt(connectorId, 10);
    this.options = options;
    this.meterValuesInterval = options.meterValuesInterval || 60;
    this.maxPowerKw = options.maxPowerKw || 22;
    this.carBatteryKwh = options.carBatteryKwh || 64;
    this.carBatteryStateOfCharge = options.carBatteryStateOfCharge || 80;
    this.secondsElapsed = 0;
    this.kwhElapsed = 0;
    this.lastMeterValuesTimestamp = undefined;
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
        meterStart: Math.round(this.kwhElapsed * 1000),
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
    await sleep(1000);
    await this.options.sendCommand('StopTransaction', {
      connectorId: this.connectorId,
      idTag: this.options.uid,
      meterStop: Math.round(this.kwhElapsed * 1000),
      timestamp: this.now().toISOString(),
      disconnectReason: 'EVDisconnected',
      transactionId: this.transactionId,
      transactionData: [
        {
          sampledValue: [
            {
              value: this.kwhElapsed.toString(),
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
    await sleep(1000);
    await this.options.sendCommand('StatusNotification', {
      connectorId: this.connectorId,
      errorCode: 'NoError',
      status: 'Available',
    });
  }
  async tick(secondsElapsed) {
    this.secondsElapsed += secondsElapsed;
    if (secondsElapsed === 0) {
      await this.options.sendCommand('StatusNotification', {
        connectorId: this.connectorId,
        errorCode: 'NoError',
        status: 'Charging',
        info: 'Charging',
      });
      return;
    }
    const amountKwhToCharge = (this.maxPowerKw / 3600) * secondsElapsed;
    const carNeededKwh =
      this.carBatteryKwh -
      this.carBatteryKwh * (this.carBatteryStateOfCharge / 100);
    const chargeLimitReached = this.kwhElapsed >= carNeededKwh;
    console.info(
      `Charge session tick (connectorId=${this.connectorId}, carNeededKwh=${carNeededKwh}, chargeLimitReached=${chargeLimitReached}, amountKwhToCharge=${amountKwhToCharge})`
    );

    if (
      this.lastMeterValuesTimestamp &&
      this.lastMeterValuesTimestamp >
        this.now() - this.meterValuesInterval * 1000
    ) {
      return;
    }

    if (chargeLimitReached) {
      await this.options.sendCommand('StatusNotification', {
        connectorId: this.connectorId,
        errorCode: 'NoError',
        status: 'SuspendedEV',
      });
    } else {
      this.kwhElapsed += amountKwhToCharge;
    }
    await sleep(100);
    this.lastMeterValuesTimestamp = this.now();
    await this.options.sendCommand('MeterValues', {
      connectorId: this.connectorId,
      transactionId: this.transactionId,
      meterValue: [
        {
          timestamp: this.now().toISOString(),
          sampledValue: [
            {
              value: this.kwhElapsed.toFixed(5),
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
