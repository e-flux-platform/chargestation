export default async function sendStatusNotificationPreparing({
  chargepoint,
  session,
}) {
  if (chargepoint.currentStatus[session.connectorId] === 'Preparing') {
    return;
  }

  await chargepoint.writeCall(
    'StatusNotification',
    {
      connectorId: session.connectorId,
      errorCode: 'NoError',
      status: 'Preparing',
    },
    session
  );
}
