export default async function handleTransactionStartedUI({
  chargepoint,
  session,
}) {
  chargepoint.onSessionStop && chargepoint.onSessionStop(session.connectorId);
}
