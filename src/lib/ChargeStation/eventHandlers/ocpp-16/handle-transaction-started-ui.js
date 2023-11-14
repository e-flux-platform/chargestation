export default async function handleTransactionStartedUI({
  chargepoint,
  session,
}) {
  chargepoint.onSessionStart && chargepoint.onSessionStart(session.connectorId);
}
