export default async function handleTransactionStartedUI(
  chargepoint,
  emitter,
  session
) {
  chargepoint.onSessionStop && chargepoint.onSessionStop(session.connectorId);
}
