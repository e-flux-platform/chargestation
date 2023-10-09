export default async function handleTransactionStoppedUI({
  chargepoint,
  session,
}) {
  chargepoint.onSessionStart && chargepoint.onSessionStart(session.connectorId);
}
