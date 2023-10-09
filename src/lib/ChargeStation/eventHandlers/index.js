import { EventEmitter } from 'events';
import { getOCPPConfiguration } from '../configurations';

export function createEventEmitter(chargepoint, ocppVersion) {
  const emitter = new ChargeStationEventEmitter(chargepoint);

  const handlerConfig = getOCPPConfiguration(ocppVersion);
  if (!handlerConfig) {
    throw new Error(`No configuration found for ${ocppVersion}`);
  }

  emitter.registerHandlers(handlerConfig);
  return emitter;
}

export class ChargeStationEventEmitter extends EventEmitter {
  constructor(chargepoint) {
    super();
    this.chargepoint = chargepoint;
  }

  registerHandlers(handlerConfig) {
    this.handlerConfig = handlerConfig;

    for (const [eventName, handlers] of Object.entries(handlerConfig)) {
      for (const handler of handlers) {
        this.on(eventName, handler);
      }
    }
  }

  emitEvent(
    eventName,
    { session, callMessageId, callMessageBody, callResultMessageBody } = {}
  ) {
    this.emit(eventName, {
      chargepoint: this.chargepoint,
      emitter: this,
      session,
      callMessageId,
      callMessageBody,
      callResultMessageBody,
    });
  }
}
