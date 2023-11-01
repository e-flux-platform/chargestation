import { toCamelCase } from './utils';
import { Connection } from './connection';
import { sleep } from 'utils/csv';
import { ChargeStationEventEmitter, createEventEmitter } from './eventHandlers';
import { EventTypes } from './eventHandlers/event-types';
import {
  ChargeStationSetting,
  OCPPVersion,
  Variable,
  VariableConfiguration,
} from 'lib/settings';
import { Map } from '../../types/generic';
import { MeterValuesRequest as MeterValuesRequest16 } from 'schemas/ocpp/1.6/MeterValues';
import { StatusNotificationRequest as StatusNotificationRequest16 } from 'schemas/ocpp/1.6/StatusNotification';
import { StatusNotificationRequest as StatusNotificationRequest20 } from 'schemas/ocpp/2.0/StatusNotificationRequest';
import { TransactionEventRequest as TransactionEventRequest20 } from 'schemas/ocpp/2.0/TransactionEventRequest';
import { v4 as uuidv4 } from 'uuid';

interface Settings {
  ocppConfiguration: string;
  ocppBaseUrl: string;
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialNumber: string;
  iccid: string;
  imsi: string;
  Identity: string;
}

interface CallLogItem {
  destination: 'charge-point' | 'central-server';
  requestReceivedAt?: Date;
  requestSentAt?: Date;
  request: { method: string; params: unknown };
  response?: {
    code: string;
    description: string;
    details: unknown;
  };
  responseSentAt?: Date;
  session?: Session;
}

type LogType = 'command' | 'message-response' | 'message' | 'error';

export default class ChargeStation {
  private ocppVersion: OCPPVersion;
  private callLog: Map<CallLogItem>;
  private sessions: Map<Session>;
  private emitter: ChargeStationEventEmitter;
  private numConnectionAttempts: number;
  private currentStatus: Map<string>;
  private connection?: Connection;
  private connected = false;
  private onLog = ({}) => {};
  private onError = (error: Error) => {};

  constructor(
    private configuration: VariableConfiguration<Variable>,
    private settings: Settings
  ) {
    this.callLog = {};
    this.sessions = {};
    this.ocppVersion = this.settings.ocppConfiguration as OCPPVersion;
    this.emitter = createEventEmitter(this, this.ocppVersion);
    this.numConnectionAttempts = 0;
    this.currentStatus = {
      1: 'Available',
      2: 'Available',
    };
  }

  getSetting(value: ChargeStationSetting) {
    return this.settings[value];
  }

  changeConfiguration(configuration: VariableConfiguration<Variable>) {
    this.configuration = configuration;
  }

  availableConnectors() {
    return ['1', '2'].filter((id) => !this.sessions[id]);
  }

  getMeterValueSampleInterval() {
    return this.configuration.getMeterValueSampleInterval();
  }

  setup() {
    try {
      this.emitter = createEventEmitter(this, this.ocppVersion);
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`${error.message}. Try to refresh the page.`);
      }
    }
  }

  getConnection(ocppBaseUrl: string, ocppIdentity: string): Connection {
    switch (this.ocppVersion) {
      case OCPPVersion.ocpp16:
        return new Connection(ocppBaseUrl, ocppIdentity, OCPPVersion.ocpp16);
      case OCPPVersion.ocpp201:
        return new Connection(ocppBaseUrl, ocppIdentity, OCPPVersion.ocpp201);
      default:
        return new Connection(ocppBaseUrl, ocppIdentity, OCPPVersion.ocpp16);
    }
  }

  getOCPPIdentityString() {
    return this.configuration.getOCPPIdentityString();
  }

  connect() {
    this.setup();
    const ocppBaseUrl = this.settings.ocppBaseUrl;
    const ocppIdentity = this.getOCPPIdentityString();
    this.log('message', `> Connecting to ${ocppBaseUrl}/${ocppIdentity}`);

    this.connection = this.getConnection(ocppBaseUrl, ocppIdentity);

    this.connection.onConnected = () => {
      this.connected = true;
      this.log('message-response', '< Connected!');
      this.emitter.emitEvent(EventTypes.StationConnected);
    };
    this.connection.onError = (error: Event) => {
      if (!this.connected) return;

      this.connected = false;

      // Not sure why this works but TS is complaining
      // @ts-ignore
      this.log('error', error.message);
      this.disconnect();
      this.reconnect();
    };
    this.connection.onReceiveCall = (
      method: string,
      body: unknown,
      messageId: string
    ) => {
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
    this.connection.onReceiveCallResult = (
      messageId: string,
      body: unknown
    ) => {
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
          callMessageBody: call.request.params,
          callMessageId: messageId,
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

  getConnectorStatus(connectorId: number) {
    return this.currentStatus[connectorId.toString()];
  }

  disconnect() {
    if (this.connection) {
      this.connection.disconnect();
      this.connected = false;
    }
  }

  reconnect() {
    if (this.numConnectionAttempts > 100) {
      this.log('error', 'Too many connection attempts, giving up');
      return;
    }
    const numSeconds = this.numConnectionAttempts < 5 ? 5 : 30;
    this.log('message', `> Reconnecting in ${numSeconds} seconds`);
    setTimeout(() => {
      if (!this.connection) throw new Error('Connection is undefined');
      this.connection.connect();
      this.numConnectionAttempts++;
    }, numSeconds * 1000);
  }

  async startSession(
    connectorId: number,
    session: {
      maxPowerKw: number;
      carBatteryKwh: number;
      carBatteryStateOfCharge: number;
    }
  ) {
    if (!this.connected) {
      throw new Error('Not connected to OCPP server, cannot start session');
    }

    this.sessions[connectorId] = new Session(
      connectorId,
      {
        ...session,
      },
      this.emitter,
      this
    );
    await this.sessions[connectorId].start();
  }

  async stopSession(connectorId: string) {
    if (!this.sessions[connectorId]) {
      return;
    }
    await this.sessions[connectorId].stop();
  }

  hasRunningSession(connectorId: string) {
    return !!this.sessions[connectorId];
  }

  isStartingSession(connectorId: string) {
    return (
      this.sessions[connectorId] && this.sessions[connectorId].isStartingSession
    );
  }

  isStoppingSession(connectorId: string) {
    return (
      this.sessions[connectorId] && this.sessions[connectorId].isStoppingSession
    );
  }

  error(error: Error) {
    this.onError && this.onError(error);
  }

  log(type: LogType, message: string, command: unknown = undefined) {
    const id = `${Date.now()}-${Math.random()}}`;
    this.onLog && this.onLog({ id, type, message, command });
  }

  writeCallError(
    callMessageId: string,
    code: string,
    description: string,
    details: object
  ) {
    if (!this.connection) {
      throw new Error('Connection is undefined');
    }

    const call = this.callLog[callMessageId];

    if (!call) {
      console.warn(
        `Received call error for unknown call with id ${callMessageId}`
      );
      return;
    }

    this.log('command', `sent ${call.request.method} command`, {
      destination: 'charge-point',
      requestReceivedAt: call.requestReceivedAt,
      request: call.request,
      response: { code, description, details },
      responseSentAt: new Date(),
    });

    this.connection.writeCallError(callMessageId, code, description, details);
  }

  writeCallResult(callMessageId: string, messageBody: object) {
    if (!this.connection) {
      throw new Error('Connection is undefined');
    }

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

  writeCall<T extends object>(
    method: string,
    callMessageBody: T,
    session?: Session
  ) {
    if (!this.connection) {
      throw new Error('Connection is undefined');
    }

    const messageId = this.connection.writeCall(method, callMessageBody);

    if (method === 'StatusNotification') {
      const message = callMessageBody as StatusNotificationRequest20 &
        StatusNotificationRequest16;

      this.currentStatus[message.connectorId.toString()] =
        message.status && message.connectorStatus;
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
interface SessionOptions {
  maxPowerKw: number;
  carBatteryKwh: number;
  carBatteryStateOfCharge: number;
}

export class Session {
  private maxPowerKw: number;
  private carBatteryKwh: number;
  private carBatteryStateOfCharge: number;
  private secondsElapsed: number;
  private kwhElapsed: number;
  private lastMeterValuesTimestamp?: Date;
  private transactionId: string;
  private meterValuesInterval: number;
  private seqNo: number;

  // TODO: Should ideally have getters and setters, but we should first convert everything to TS
  isStartingSession = false;
  isStoppingSession = false;
  startTime: Date = new Date();

  constructor(
    private connectorId: number,
    private options: SessionOptions,
    private emitter: ChargeStationEventEmitter,
    private chargeStation: ChargeStation
  ) {
    this.connectorId = connectorId;
    this.options = options;
    this.meterValuesInterval =
      chargeStation.getMeterValueSampleInterval() || 60;
    this.maxPowerKw = options.maxPowerKw || 22;
    this.carBatteryKwh = options.carBatteryKwh || 64;
    this.carBatteryStateOfCharge = options.carBatteryStateOfCharge || 80;
    this.secondsElapsed = 0;
    this.kwhElapsed = 0;
    this.lastMeterValuesTimestamp = undefined;
    this.emitter = emitter;
    this.seqNo = 0;
    this.transactionId = uuidv4().toString();
  }

  get connectorStatus(): string {
    return this.chargeStation.getConnectorStatus(this.connectorId);
  }

  now(): Date {
    return new Date();
  }

  async start() {
    this.emitter.emitEvent(EventTypes.SessionStartInitiated, { session: this });
  }
  async stop() {
    this.emitter.emitEvent(EventTypes.SessionStopInitiated, { session: this });
  }
  async tick(secondsElapsed: number) {
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
      `Charge session tick (connectorId=${this.connectorId}, carNeededKwh=${carNeededKwh}, chargeLimitReached=${chargeLimitReached}, amountKwhToCharge=${amountKwhToCharge}, currentStatus=${this.connectorStatus}`
    );

    if (
      this.lastMeterValuesTimestamp &&
      this.lastMeterValuesTimestamp.valueOf() >
        this.now().valueOf() - this.meterValuesInterval * 1000
    ) {
      return;
    }
    if (chargeLimitReached) {
      // TODO: send status notification message
      this.emitter.emitEvent(EventTypes.ChargingLimitReached, {
        session: this,
      });
      // await this.chargeStation.writeCall<StatusNotificationRequest16>('StatusNotification', {
      //   connectorId: this.connectorId,
      //   errorCode: 'NoError',
      //   status: 'SuspendedEV',
      // });
    } else if (['Charging', 'Occupied'].includes(this.connectorStatus)) {
      this.kwhElapsed += amountKwhToCharge;
    }
    await sleep(100);

    this.lastMeterValuesTimestamp = this.now();

    this.seqNo += 1;

    // TODO: send meter values message
    this.emitter.emitEvent(EventTypes.ChargingTick, { session: this });
    // if (this.ocppVersion === 'ocpp2.0.1') {
    //   this.chargeStation.writeCall<TransactionEventRequest20>('TransactionEvent', {
    //     eventType: 'Updated',
    //     timestamp: this.now().toISOString(),
    //     triggerReason: 'MeterValuePeriodic',
    //     seqNo: this.seqNo,
    //     transactionInfo: {
    //       transactionId: this.transactionId?.toString() || '',
    //     },
    //     meterValue: [
    //       {
    //         sampledValue: [
    //           {
    //             value: Number(this.kwhElapsed.toFixed(3)),
    //             context: 'Sample.Periodic',
    //             measurand: 'Energy.Active.Import.Register',
    //             location: 'Outlet',
    //             unitOfMeasure: { unit: 'kWh' },
    //           },
    //         ],
    //         timestamp: this.now().toISOString(),
    //       },
    //     ],
    //     evse: { id: 1, connectorId: this.connectorId },
    //   });
    // } else {
    //   await this.chargeStation.writeCall<MeterValuesRequest16>('MeterValues', {
    //     connectorId: this.connectorId,
    //     transactionId: this.transactionId,
    //     meterValue: [
    //       {
    //         timestamp: this.now().toISOString(),
    //         sampledValue: [
    //           {
    //             value: this.kwhElapsed.toFixed(5),
    //             context: 'Sample.Periodic',
    //             measurand: 'Energy.Active.Import.Register',
    //             location: 'Outlet',
    //             unit: 'kWh',
    //           },
    //         ],
    //       },
    //     ],
    //   },
    //   this
    // );
  }
}
