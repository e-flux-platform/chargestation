import { EventTypes } from '../event-types';

export default async function handleAuthorizeCallResultReceived({
  emitter,
  session,
  callResultMessageBody,
}) {
  if (callResultMessageBody.idTagInfo.status !== 'Accepted') {
    emitter.emitEvent(EventTypes.AuthorizationFailed, { session });
    alert('Token UID was not accepted');
    return;
  }

  emitter.emitEvent(EventTypes.AuthorizationAccepted, { session });
}
