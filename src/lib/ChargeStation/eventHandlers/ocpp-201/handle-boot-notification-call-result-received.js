import { EventTypes } from '../event-types';

export default async function handleBootNotificationCallResultReceived({
  emitter,
}) {
  emitter.emitEvent(EventTypes.BootNotificationAccepted);
}
