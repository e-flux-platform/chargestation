import { EventEmitter } from 'events';
import { getOCPPConfiguration } from '../configurations';
import ChargeStation, { Session } from 'lib/ChargeStation';
import { OCPPVersion } from 'lib/settings';
import { Map } from '../../../types/generic';

interface ChargeStationEventHandlerParams<CallBodyType, CallResultBodyType> {
  chargepoint: ChargeStation;
  emitter: ChargeStationEventEmitter;
  session: Session;
  callMessageId: string;
  callMessageBody: CallBodyType;
  callResultMessageBody: CallResultBodyType;
}

type ChargeStationEventHandler = (
  params: ChargeStationEventHandlerParams<unknown, unknown>
) => void;

interface EmitEventParams {
  session?: unknown;
  callMessageId?: string;
  callMessageBody?: unknown;
  callResultMessageBody?: unknown;
}

export function createEventEmitter(
  chargeStation: ChargeStation,
  ocppVersion: OCPPVersion
) {
  const emitter = new ChargeStationEventEmitter(chargeStation);

  const handlerConfig = getOCPPConfiguration(ocppVersion);
  if (!handlerConfig) {
    throw new Error(`No configuration found for ${ocppVersion}`);
  }

  emitter.registerHandlers(handlerConfig);
  return emitter;
}

export class ChargeStationEventEmitter extends EventEmitter {
  private handlerConfig: Map<ChargeStationEventHandler[]> = {};

  constructor(private chargeStation: ChargeStation) {
    super();
  }

  registerHandlers(handlerConfig: Map<ChargeStationEventHandler[]>) {
    this.handlerConfig = handlerConfig;

    for (const [eventName, handlers] of Object.entries(handlerConfig)) {
      for (const handler of handlers) {
        this.on(eventName, handler);
      }
    }
  }

  emitEvent(
    eventName: string,
    {
      session,
      callMessageId,
      callMessageBody,
      callResultMessageBody,
    }: EmitEventParams = {}
  ) {
    this.emit(eventName, {
      chargepoint: this.chargeStation,
      emitter: this,
      session,
      callMessageId,
      callMessageBody,
      callResultMessageBody,
    });
  }
}
