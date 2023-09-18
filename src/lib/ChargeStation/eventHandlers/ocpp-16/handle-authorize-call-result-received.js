import { sleep } from '../../../../utils/csv';
import { EventTypes, EventTypes16 } from '../event-types';

export default async function handleAuthorizeCallResultReceived({
  emitter,
  session,
  callResultMessageBody,
}) {
  if (callResultMessageBody.idTagInfo.status === 'Invalid') {
    emitter.emitEvent(EventTypes16.AuthorizationFailed, { session });
    return;
  }

  emitter.emitEvent(EventTypes16.AuthorizationAccepted, { session });
}
