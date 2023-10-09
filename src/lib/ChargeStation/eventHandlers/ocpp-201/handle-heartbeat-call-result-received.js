import { EventTypes } from '../event-types';

export default async function handleHeartbeatCallResultReceived({ emitter }) {
  emitter.emitEvent(EventTypes.HeartbeatAccepted);
}
