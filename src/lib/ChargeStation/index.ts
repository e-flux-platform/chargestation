import { toCamelCase } from './utils';
import { Connection } from './connection';
import { sleep } from 'utils/csv';
import { ChargeStationEventEmitter, createEventEmitter } from './eventHandlers';
import { EventTypes } from './eventHandlers/event-types';
import {
  AuthorizationType,
  ChargeStationSetting,
  getConfiguration,
  OCPPVersion,
  Variable,
  VariableConfiguration,
} from 'lib/settings';
import { Map } from '../../types/generic';
import { StatusNotificationRequest as StatusNotificationRequest16 } from 'schemas/ocpp/1.6/StatusNotification';
import { StatusNotificationRequest as StatusNotificationRequest20 } from 'schemas/ocpp/2.0/StatusNotificationRequest';

import clock, { Interval } from './clock';

export interface Settings {
  ocppConfiguration: string;
  ocppBaseUrl: string;
  interactiveMessagesReply: boolean;
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialNumber: string;
  iccid: string;
  imsi: string;
  privateKey?: string;
  Identity: string;
  eTotemTerminalMode: 'etotem' | 'etotem_offline';
  eTotemCostCalculationMode:
    | 'Legacy'
    | 'DureeConsoReelleSession'
    | 'DureeConsoSession';
  eTotemFlatRateAmount: number;
  eTotemPerSessionAmount: number;
  eTotemPeriodDuration: number;
  eTotemPerPeriodAmount: number;
  eTotemPerKWhAmount: number;
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

type LogType =
  | 'command'
  | 'message-response'
  | 'message'
  | 'error'
  | 'connected';

export default class ChargeStation {
  private ocppVersion: OCPPVersion;
  private callLog: Map<CallLogItem>;
  private emitter: ChargeStationEventEmitter;
  private numConnectionAttempts: number;
  private connection?: Connection;
  private onLog = ({}) => {};
  private onError = (error: Error) => {};

  public currentStatus: Map<string>;
  public sessions: Map<Session>;
  public connected = false;
  public firmwareVersion: string;
  public callToReplyManually: {
    messageId: string;
    action: string;
    payload: any;
  } | null = null;

  constructor(
    public configuration: VariableConfiguration<Variable>,
    public settings: Settings
  ) {
    this.callLog = {};
    this.sessions = {};
    this.firmwareVersion = 'v1-000';
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

  connect() {
    this.setup();
    const ocppBaseUrl = this.settings.ocppBaseUrl;
    const ocppIdentity = this.configuration.getOCPPIdentityString();
    this.log('message', `> Connecting to ${ocppBaseUrl}/${ocppIdentity}`);

    this.connection = this.getConnection(ocppBaseUrl, ocppIdentity);

    this.connection.onConnected = () => {
      this.connected = true;
      this.log('connected', '< Connected!');
      this.emitter.emitEvent(EventTypes.StationConnected);
    };
    this.connection.onError = (error: Event) => {
      if (!this.connected) {
        return;
      }

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
        requestReceivedAt: clock.now(),
        request: { method, params: body },
      };

      if (this.settings.interactiveMessagesReply) {
        this.callToReplyManually = { messageId, action: method, payload: body };
      } else {
        this.emitter.emitEvent(`${toCamelCase(method)}Received`, {
          callMessageBody: body,
          callMessageId: messageId,
        });
      }
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
        responseReceivedAt: clock.now(),
      });
    };
    this.connection.connect();
    this.numConnectionAttempts++;
  }

  disconnect() {
    if (this.connection) {
      this.connection.disconnect();
      this.connected = false;
    }
  }

  reboot() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  reconnect() {
    if (this.numConnectionAttempts > 100) {
      this.log('error', 'Too many connection attempts, giving up');
      return;
    }
    const numSeconds = this.numConnectionAttempts < 5 ? 5 : 30;
    this.log('message', `> Reconnecting in ${numSeconds} seconds`);
    setTimeout(() => {
      if (!this.connection) {
        throw new Error('Connection is undefined');
      }
      this.connection.connect();
      this.numConnectionAttempts++;
    }, numSeconds * 1000);
  }

  async startSession(
    connectorId: number,
    session: SessionOptions,
    authorizationType: AuthorizationType
  ) {
    if (!this.connected) {
      throw new Error('Not connected to OCPP server, cannot start session');
    }

    this.sessions[connectorId] = new Session(
      connectorId,
      {
        ...session,
        authorizationType,
      },
      this.emitter,
      this
    );
    await this.sessions[connectorId].start();
  }

  async stopSession(connectorId: number) {
    if (!this.sessions[connectorId]) {
      return;
    }
    await this.sessions[connectorId].stop();
  }

  hasRunningSession(connectorId: number) {
    return !!this.sessions[connectorId];
  }

  getSessions() {
    return Object.values(this.sessions);
  }

  isStartingSession(connectorId: number) {
    return (
      this.sessions[connectorId] && this.sessions[connectorId].isStartingSession
    );
  }

  isStoppingSession(connectorId: number) {
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
      responseSentAt: clock.now(),
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
      responseSentAt: clock.now(),
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

      this.currentStatus[message.connectorId] =
        message.status || message.connectorStatus;
    }

    this.callLog[messageId] = {
      destination: 'central-server',
      requestSentAt: clock.now(),
      request: { method, params: callMessageBody },
      // Keep a reference to the session so that we can use it in the call result handler
      // (it's not pretty...)
      session,
    };

    return messageId;
  }

  sendStatusNotification(connectorId: number, status: string) {
    this.writeCall('StatusNotification', {
      connectorId,
      status,
      errorCode: 'NoError',
    });
  }

  save() {
    ChargeStationStorage.save(this);
  }

  static load(): ChargeStation | undefined {
    return ChargeStationStorage.load();
  }
}

export class ChargeStationStorage {
  private static storageKey = 'chargeStationSettingsCache';

  static save(chargeStation: ChargeStation) {
    sessionStorage.setItem(
      ChargeStationStorage.storageKey,
      JSON.stringify({
        settings: chargeStation.settings,
        config: chargeStation.configuration.variablesToKeyValueMap(),
      })
    );
  }

  static load(): ChargeStation | undefined {
    // check session storage
    const data = sessionStorage.getItem(ChargeStationStorage.storageKey);
    if (!data) {
      return undefined;
    }

    const storedState = JSON.parse(data);
    if (!storedState) {
      return undefined;
    }

    const { settings, config } = storedState;
    const version = settings.ocppConfiguration;
    const configuration = getConfiguration(version, settings);
    configuration.updateVariablesFromKeyValueMap(config);

    return new ChargeStation(configuration, settings);
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
  uid: string;
  idTokenType?: string;
  authorizationType: AuthorizationType;
  remoteStartId?: number;
  skipAuthorize?: boolean;
  ignoreCSMSAuthResponse?: boolean;
}

export class Session {
  private maxPowerKw: number;
  private carBatteryKwh: number;
  private carBatteryStateOfCharge: number;
  private secondsElapsed: number;
  private lastMeterValuesTimestamp?: Date;
  private meterValuesInterval: number;

  kwhElapsed: number;
  seqNo: number;
  transactionId: string;
  tickInterval?: Interval;
  remoteStartId?: number;
  suspended?: boolean;
  ignoreCSMSAuthResponse?: boolean;

  // TODO: Should ideally have getters and setters, but we should first convert everything to TS
  isStartingSession = false;
  isStoppingSession = false;
  startTime: Date = clock.now();
  stopTime: Date | undefined;

  constructor(
    public connectorId: number,
    public options: SessionOptions,
    private emitter: ChargeStationEventEmitter,
    private chargeStation: ChargeStation
  ) {
    this.options = options;
    this.meterValuesInterval =
      chargeStation.getMeterValueSampleInterval() || 60;
    this.maxPowerKw = options.maxPowerKw || 22;
    this.carBatteryKwh = options.carBatteryKwh || 64;
    this.carBatteryStateOfCharge = options.carBatteryStateOfCharge || 80;
    this.remoteStartId = options.remoteStartId;
    this.ignoreCSMSAuthResponse = options.ignoreCSMSAuthResponse || false;
    this.secondsElapsed = 0;
    this.kwhElapsed = 0;
    this.lastMeterValuesTimestamp = undefined;
    this.emitter = emitter;
    this.seqNo = 0;
    this.suspended = false;
    // ocpp 1.6 requires transationId to be a number
    // ocpp 2.0.1 requires transactionId to be a string
    this.transactionId = Math.floor(Math.random() * 100_000).toString();
  }

  get connectorStatus(): string {
    return this.chargeStation.currentStatus[this.connectorId];
  }

  get stateOfCharge(): number {
    return this.carBatteryStateOfCharge;
  }

  now(): Date {
    return clock.now();
  }

  async start() {
    this.emitter.emitEvent(EventTypes.SessionStartInitiated, { session: this });
  }

  async stop() {
    this.stopTime = this.now();
    this.emitter.emitEvent(EventTypes.SessionStopInitiated, { session: this });
  }

  async tick(secondsElapsed: number) {
    if (secondsElapsed <= 0) {
      return;
    }

    this.secondsElapsed += secondsElapsed;

    if (!this.suspended) {
      const amountKwhToCharge = (this.maxPowerKw / 3600) * secondsElapsed;

      this.carBatteryStateOfCharge +=
        (amountKwhToCharge / this.carBatteryKwh) * 100;

      this.carBatteryStateOfCharge = Math.min(
        this.carBatteryStateOfCharge,
        100
      );

      const carNeededKwh =
        this.carBatteryKwh -
        this.carBatteryKwh * (this.carBatteryStateOfCharge / 100);

      const chargeLimitReached = carNeededKwh <= 0;

      console.info('Charging', {
        clock: this.now().toISOString(),
        speed: clock.getSpeed(),
        connectorId: this.connectorId,
        stateOfCharge: this.carBatteryStateOfCharge,
        chargeAddedKwh: amountKwhToCharge,
        carNeededKwh,
        chargeLimitReached,
        connectorStatus: this.connectorStatus,
      });

      if (chargeLimitReached) {
        this.suspended = true;
        this.emitter.emitEvent(EventTypes.ChargingLimitReached, {
          session: this,
        });
      } else if (['Charging', 'Occupied'].includes(this.connectorStatus)) {
        this.kwhElapsed += amountKwhToCharge;
      }
      await sleep(100);
    }

    if (
      this.lastMeterValuesTimestamp &&
      clock.secondsSince(this.lastMeterValuesTimestamp) <
        this.meterValuesInterval
    ) {
      return;
    }

    this.lastMeterValuesTimestamp = this.now();
    this.seqNo += 1;
    this.emitter.emitEvent(EventTypes.ChargingTick, { session: this });
  }
}
