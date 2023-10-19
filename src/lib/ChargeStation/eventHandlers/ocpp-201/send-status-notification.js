import { sleep } from '../../../../utils/csv';

export default async function sendStatusNotification({ chargepoint }) {
  await sleep(1000);

  chargepoint.writeCall('StatusNotification', {
    timestamp: new Date().toISOString(),
    connectorStatus: 'Available',
    evseId: 0,
    connectorId: 0,
  });

  await sleep(2000);

  chargepoint.writeCall('StatusNotification', {
    timestamp: new Date().toISOString(),
    connectorStatus: 'Available',
    evseId: 1,
    connectorId: 1,
  });

  await sleep(1000);

  chargepoint.writeCall('StatusNotification', {
    timestamp: new Date().toISOString(),
    connectorStatus: 'Available',
    evseId: 2,
    connectorId: 1,
  });
}
