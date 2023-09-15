import { extractOcppBaseUrlFromConfiguration } from './utils';
import { Connection } from '../protocols/ocpp-1.6';
import { sleep } from 'utils/csv';
import { createEventEmitter } from './eventHandlers';

export default class ChargeStation {
  constructor(configuration, options = {}) {
    this.configuration = configuration;
    this.options = options;
    this.sessions = {};
    this.emitter = createEventEmitter(this);
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
    const ocppBaseUrl =
      extractOcppBaseUrlFromConfiguration(this.configuration) ||
      this.options.ocppBaseUrl;
    const ocppIdentity = this.configuration['Identity'];
    this.log('message', `> Connecting to ${ocppBaseUrl}/${ocppIdentity}`);
    this.connection = new Connection(ocppBaseUrl, ocppIdentity);
    this.connection.onConnected = () => {
      this.connected = true;
      this.log('message-response', '< Connected!');
      this.emitter.emitEvent('stationConnected');
    };
    this.connection.onError = (error) => {
      this.connection = false;
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
      });
      return response;
    };
    this.connection.connect();
    this.numConnectionAttempts++;
  }
  disconnect() {
    this.connection.disconnect();
    this.stopHeartbeat();
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
  async startSession(connectorId, session) {
    if (!this.connected) {
      throw new Error('Not connected to OCPP server, cannot start session');
    }

    this.sessions[connectorId] = new Session(
      connectorId,
      {
        ...session,
        sendCommand: this.sendCommand.bind(this),
        meterValuesInterval: parseInt(
          this.configuration['MeterValueSampleInterval'] || '60',
          10
        ),
				getCurrentStatus: () => this.currentStatus[connectorId],
      },
      this.emitter
    );
    await this.sessions[connectorId].start();
  }
  async stopSession(connectorId, statusFn) {
    if (!this.sessions[connectorId]) {
      return;
    }
    await this.sessions[connectorId].stop();
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
    if (method === 'StatusNotification' && params.status && params.connectorId) {
      this.currentStatus[params.connectorId] = params.status;
    }
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
  constructor(connectorId, options = {}, emitter) {
    this.connectorId = parseInt(connectorId, 10);
    this.options = options;
    this.meterValuesInterval = options.meterValuesInterval || 60;
    this.maxPowerKw = options.maxPowerKw || 22;
    this.carBatteryKwh = options.carBatteryKwh || 64;
    this.carBatteryStateOfCharge = options.carBatteryStateOfCharge || 80;
    this.secondsElapsed = 0;
    this.kwhElapsed = 0;
    this.lastMeterValuesTimestamp = undefined;
    this.emitter = emitter;
  }
  now() {
    return new Date();
  }
  async start() {
    this.emitter.emitEvent('sessionStartedAttempt', this);
  }
  async stop() {
    this.emitter.emitEvent('sessionStoppedAttempt', this);
  }
  async tick(secondsElapsed) {
    this.secondsElapsed += secondsElapsed;
    if (secondsElapsed === 0) {
      return;
    }
    const amountKwhToCharge = (this.maxPowerKw / 3600) * secondsElapsed;
    const carNeededKwh =
      this.carBatteryKwh -
      this.carBatteryKwh * (this.carBatteryStateOfCharge / 100);
    const chargeLimitReached = this.kwhElapsed >= carNeededKwh;
    console.info(
      `Charge session tick (connectorId=${this.connectorId}, carNeededKwh=${carNeededKwh}, chargeLimitReached=${chargeLimitReached}, amountKwhToCharge=${amountKwhToCharge}, currentStatus=${this.options.getCurrentStatus()}`
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
    } else if (this.options.getCurrentStatus() === 'Charging') {
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
