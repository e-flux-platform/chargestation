export default async function sendStatusNotificationCharging({
  chargepoint,
  session,
}) {
  await chargepoint.writeCall('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Charging',
    info: 'Charging',
  });
}
