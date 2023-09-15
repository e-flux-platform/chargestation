import { sleep } from '../../../../utils/csv';

export default async function sendStatusNotificationAvailable(
  chargepoint,
  emitter,
  session
) {
  await sleep(200);

  await chargepoint.sendCommand('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Available',
  });
}
