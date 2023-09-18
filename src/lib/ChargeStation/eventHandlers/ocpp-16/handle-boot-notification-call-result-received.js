import { sleep } from '../../../../utils/csv';
import { EventTypes16 } from '../event-types';

export default async function handleBootNotificationCallResultReceived({
  emitter,
}) {
  // TODO: Handle rejections

  emitter.emitEvent(EventTypes16.BootNotificationAccepted);
}
