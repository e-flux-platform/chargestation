import { EventEmitter } from 'events';
import DefaultOCPP16 from '../configurations/default-ocpp-16';
import { getOCPPConfiguration } from '../configurations';

export function createEventEmitter(chargepoint, ocppConfiguration) {
  const emitter = new ChargepointEventEmitter(chargepoint);
  const handlerConfig =
    getOCPPConfiguration(ocppConfiguration) || DefaultOCPP16;

  emitter.registerHandlers(handlerConfig);
  return emitter;
}

export class ChargepointEventEmitter extends EventEmitter {
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

  emitEvent(eventName, session) {
    console.log(`Emitting event ${eventName}`);
    this.emit(eventName, this.chargepoint, this, session);
  }
}
