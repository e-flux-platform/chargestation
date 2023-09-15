import { sleep } from '../../../../utils/csv';

export default async function sendStatusNotificationAvailable(
  chargepoint,
  emitter,
  session
) {
  await sleep(200);

  if (session?.connectorId) {
    await chargepoint.sendCommand('StatusNotification', {
      connectorId: session.connectorId,
      errorCode: 'NoError',
      status: 'Available',
    });
    return;
  }

  for (let i = 0; i < chargepoint.configuration.NumberOfConnectors; i++) {
    await chargepoint.sendCommand('StatusNotification', {
      connectorId: i + 1,
      errorCode: 'NoError',
      status: 'Available',
    });
  }
}
