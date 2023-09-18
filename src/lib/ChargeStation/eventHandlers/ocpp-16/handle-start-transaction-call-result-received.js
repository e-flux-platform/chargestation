import { EventTypes16 } from '../event-types';

export default async function handleStartTransactionCallResultReceived({
  emitter,
  callResultMessageBody,
  session,
  chargepoint,
}) {
  if (callResultMessageBody.idTagInfo.status === 'Invalid') {
    emitter.emitEvent(EventTypes16.AuthorizationFailedDuringStartTransaction, {
      session,
    });
    return;
  }
  session.transactionId = callResultMessageBody.transactionId;
  chargepoint.sessions[session.connectorId].isStartingSession = false;

  emitter.emitEvent(EventTypes16.StartTransactionAccepted, { session });
}
