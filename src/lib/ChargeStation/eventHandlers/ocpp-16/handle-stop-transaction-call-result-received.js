import { EventTypes16 } from '../event-types';

export default async function handleStopTransactionCallResultReceived({
  emitter,
  session,
  chargepoint,
}) {
  // TODO: Listen for rejections

  delete chargepoint.sessions[session.connectorId];

  emitter.emitEvent(EventTypes16.StopTransactionAccepted, session);
}
