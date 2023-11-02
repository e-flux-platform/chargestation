import { EventTypes } from '../event-types';

export default async function handleAuthorizeCallResultReceived({
  emitter,
  session,
  callResultMessageBody,
}) {
  if (callResultMessageBody.idTagInfo.status === 'Invalid') {
    emitter.emitEvent(EventTypes.AuthorizationFailed, { session });
    alert('RFID card UID is invalid');
    return;
  }

  emitter.emitEvent(EventTypes.AuthorizationAccepted, { session });
}
