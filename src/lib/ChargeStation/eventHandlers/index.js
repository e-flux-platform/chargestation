import { EventEmitter } from 'events';
import ocpp16BaseConfig from '../configurations/base-16';

export function createEventEmitter(chargepoint) {
  const emitter = new ChargepointEventEmitter(chargepoint);
  emitter.registerHandlers(ocpp16BaseConfig);
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
