import { EventTypes, EventTypes16 } from '../event-types';

export default async function handleStopTransactionCallResultReceived({
  emitter,
  callResultMessageBody,
  session,
  chargepoint,
}) {
  if (callResultMessageBody.idTagInfo.status !== 'Accepted') {
    emitter.emitEvent(EventTypes.AuthorizationFailedDuringTransactionStop, {
      session,
    });
    return;
  }

  delete chargepoint.sessions[session.connectorId];

  emitter.emitEvent(EventTypes16.StopTransactionAccepted, { session });
}
