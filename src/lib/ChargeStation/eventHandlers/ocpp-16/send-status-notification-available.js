import { sleep } from '../../../../utils/csv';

export default async function sendStatusNotificationAvailable({
  chargepoint,
  session,
}) {
  await sleep(200);

  if (session?.connectorId) {
    await chargepoint.writeCall('StatusNotification', {
      connectorId: session.connectorId,
      errorCode: 'NoError',
      status: 'Available',
    });
    return;
  }

  const numConnectors =
    chargepoint.configuration.getVariableValue('NumberOfConnectors');
  for (let i = 0; i < numConnectors; i++) {
    await chargepoint.writeCall(
      'StatusNotification',
      {
        connectorId: i + 1,
        errorCode: 'NoError',
        status: 'Available',
      },
      session
    );
  }
}
