import { EventTypes16 } from '../event-types';

export default async function handleHeartbeatCallResultReceived({ emitter }) {
  emitter.emitEvent(EventTypes16.HeartbeatAccepted);
}
