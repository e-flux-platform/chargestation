export default async function sendStatusNotificationCharging(
  chargepoint,
  emitter,
  session
) {
  await chargepoint.sendCommand('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Charging',
    info: 'Charging',
  });
}
