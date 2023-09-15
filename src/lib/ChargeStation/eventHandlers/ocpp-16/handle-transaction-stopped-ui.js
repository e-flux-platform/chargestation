export default async function handleTransactionStoppedUI(
  chargepoint,
  emitter,
  session
) {
  chargepoint.onSessionStart && chargepoint.onSessionStart(session.connectorId);
}
