import { EventTypes } from '../event-types';

export default async function handleAuthorizeCallResultReceived({
  emitter,
  session,
  callResultMessageBody,
}) {
  if (callResultMessageBody.idTokenInfo.status !== 'Accepted') {
    emitter.emitEvent(EventTypes.AuthorizationFailed, { session });
    alert('RFID card UID is invalid');
    return;
  }

  emitter.emitEvent(EventTypes.AuthorizationAccepted, { session });
}
