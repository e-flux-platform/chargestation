export default async function sendStatusNotificationPreparing({
  chargepoint,
  session,
}) {
  await chargepoint.writeCall('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Preparing',
  });
}
