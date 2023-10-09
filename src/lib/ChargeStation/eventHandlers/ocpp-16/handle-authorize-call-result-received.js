import { EventTypes16 } from '../event-types';

export default async function handleAuthorizeCallResultReceived({
  emitter,
  session,
  callResultMessageBody,
}) {
  if (callResultMessageBody.idTagInfo.status === 'Invalid') {
    emitter.emitEvent(EventTypes16.AuthorizationFailed, { session });
    alert('RFID card UID is invalid');
    return;
  }

  emitter.emitEvent(EventTypes16.AuthorizationAccepted, { session });
}
