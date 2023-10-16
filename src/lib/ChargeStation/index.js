import { toCamelCase } from './utils';
import { Connection } from './connection';
import { sleep } from 'utils/csv';
import { createEventEmitter } from './eventHandlers';
import { EventTypes } from './eventHandlers/event-types';

export default class ChargeStation {
  constructor(configuration, options = {}) {
    this.configuration = configuration;
    this.options = options;
    this.callLog = {};
    this.sessions = {};
    this.emitter = createEventEmitter(this, options?.ocppConfiguration);
    this.numConnectionAttempts = 0;
    this.currentStatus = {
      1: 'Available',
      2: 'Available',
    };
  }

  changeConfiguration(configuration) {
    this.configuration = configuration;
  }

  availableConnectors() {
    return ['1', '2'].filter((id) => !this.sessions[id]);
  }

  setup() {
    try {
      this.emitter = createEventEmitter(this, this.options?.ocppConfiguration);
    } catch (error) {
      this.emitter = null;
      alert(`${error.message}. Try to refresh the page.`);
    }
  }

  getConnection(ocppBaseUrl, ocppIdentity) {
    switch (this.options?.ocppConfiguration) {
      case 'ocpp1.6':
        return new Connection(ocppBaseUrl, ocppIdentity, 'ocpp1.6');
      case 'ocpp2.0.1':
        return new Connection(ocppBaseUrl, ocppIdentity, 'ocpp2.0.1');
      default:
        return new Connection(ocppBaseUrl, ocppIdentity, 'ocpp1.6');
    }
  }

  connect() {
    this.setup();
    const ocppBaseUrl = this.options.ocppBaseUrl || this.options.ocppBaseUrl;
    const ocppIdentity = this.configuration.getOCPPIdentityString();
    this.log('message', `> Connecting to ${ocppBaseUrl}/${ocppIdentity}`);

    this.connection = this.getConnection(ocppBaseUrl, ocppIdentity);

    this.connection.onConnected = () => {
      this.connected = true;
      this.log('message-response', '< Connected!');
      this.emitter.emitEvent(EventTypes.StationConnected);
    };
    this.connection.onError = (error) => {
      if (!this.connected) return;

      this.connected = false;
      this.log('error', error.message);
      this.disconnect();
      this.reconnect();
    };
    this.connection.onReceiveCall = (method, body, messageId) => {
      this.callLog[messageId] = {
        destination: 'charge-point',
        requestReceivedAt: new Date(),
        request: { method, params: body },
      };

      this.emitter.emitEvent(`${toCamelCase(method)}Received`, {
        callMessageBody: body,
        callMessageId: messageId,
      });
    };
    this.connection.onReceiveCallResult = (messageId, body) => {
      const call = this.callLog[messageId];
      if (!call) {
        console.warn(
          `Received call result for unknown command with id ${messageId}`
        );
        return;
      }

      this.emitter.emitEvent(
        `${toCamelCase(call.request.method)}CallResultReceived`,
        {
          callResultMessageBody: body,
          session: call.session,
        }
      );

      this.log('command', `received ${call.request.method} command`, {
        destination: 'central-server',
        requestSentAt: call.requestSentAt,
        request: call.request,
        response: body,
        responseReceivedAt: new Date(),
      });
    };
    this.connection.connect();
    this.numConnectionAttempts++;
  }

  disconnect() {
    this.connection.disconnect();
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
        writeCall: this.writeCall.bind(this),
        writeCallResult: this.writeCallResult.bind(this),
        meterValuesInterval: this.configuration.getMeterValueSampleInterval(),
        getCurrentStatus: () => this.currentStatus[connectorId],
      },
      this.emitter
    );
    await this.sessions[connectorId].start();
  }

  async stopSession(connectorId) {
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

  error(error) {
    this.onError && this.onError(error);
  }

  log(type, message, command = undefined) {
    const id = `${Date.now()}-${Math.random()}}`;
    this.onLog && this.onLog({ id, type, message, command });
  }

  writeCallResult(callMessageId, messageBody) {
    const call = this.callLog[callMessageId];

    if (!call) {
      console.warn(
        `Received call result for unknown call with id ${callMessageId}`
      );
      return;
    }

    this.log('command', `sent ${call.request.method} command`, {
      destination: 'charge-point',
      requestReceivedAt: call.requestReceivedAt,
      request: call.request,
      response: messageBody,
      responseSentAt: new Date(),
    });

    this.connection.writeCallResult(callMessageId, messageBody);
  }

  writeCall(method, callMessageBody, session) {
    const messageId = this.connection.writeCall(method, callMessageBody);

    if (
      method === 'StatusNotification' &&
      callMessageBody.status &&
      callMessageBody.connectorId
    ) {
      this.currentStatus[callMessageBody.connectorId] = callMessageBody.status;
    }

    this.callLog[messageId] = {
      destination: 'central-server',
      requestSentAt: new Date(),
      request: { method, params: callMessageBody },
      // Keep a reference to the session so that we can use it in the call result handler
      // (it's not pretty...)
      session,
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
    this.emitter.emitEvent(EventTypes.SessionStartInitiated, { session: this });
  }
  async stop() {
    this.emitter.emitEvent(EventTypes.SessionStopInitiated, { session: this });
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
      `Charge session tick (connectorId=${
        this.connectorId
      }, carNeededKwh=${carNeededKwh}, chargeLimitReached=${chargeLimitReached}, amountKwhToCharge=${amountKwhToCharge}, currentStatus=${this.options.getCurrentStatus()}`
    );

    if (
      this.lastMeterValuesTimestamp &&
      this.lastMeterValuesTimestamp >
        this.now() - this.meterValuesInterval * 1000
    ) {
      return;
    }
    if (chargeLimitReached) {
      await this.options.writeCall('StatusNotification', {
        connectorId: this.connectorId,
        errorCode: 'NoError',
        status: 'SuspendedEV',
      });
    } else if (this.options.getCurrentStatus() === 'Charging') {
      this.kwhElapsed += amountKwhToCharge;
    }
    await sleep(100);
    this.lastMeterValuesTimestamp = this.now();

    await this.options.writeCall('MeterValues', {
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
