import { sleep } from '../../../../utils/csv';

export default async function sendStatusNotificationActive(
  chargepoint,
  emitter
) {
  await sleep(200);

  await chargepoint.sendCommand('StatusNotification', {
    connectorId: 1,
    errorCode: 'NoError',
    status: 'Available',
  });
  await sleep(200);
  await chargepoint.sendCommand('StatusNotification', {
    connectorId: 2,
    errorCode: 'NoError',
    status: 'Available',
  });
}
