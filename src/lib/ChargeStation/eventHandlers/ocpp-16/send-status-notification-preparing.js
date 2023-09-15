export default async function sendStatusNotificationPreparing(
  chargepoint,
  emitter,
  session
) {
  await chargepoint.sendCommand('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Preparing',
  });
}
