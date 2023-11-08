import { sleep } from '../../../../utils/csv';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import clock from '../../clock';
const sendStatusNotification: ChargeStationEventHandler = async ({
  chargepoint,
}) => {
  await sleep(1000);

  await chargepoint.writeCall('StatusNotification', {
    timestamp: clock.now().toISOString(),
    connectorStatus: 'Available',
    evseId: 0,
    connectorId: 0,
  });

  await sleep(2000);

  await chargepoint.writeCall('StatusNotification', {
    timestamp: clock.now().toISOString(),
    connectorStatus: 'Available',
    evseId: 1,
    connectorId: 1,
  });

  await sleep(2000);

  await chargepoint.writeCall('StatusNotification', {
    timestamp: clock.now().toISOString(),
    connectorStatus: 'Available',
    evseId: 1,
    connectorId: 2,
  });

  await sleep(2000);

  await chargepoint.writeCall('StatusNotification', {
    timestamp: clock.now().toISOString(),
    connectorStatus: 'Available',
    evseId: 2,
    connectorId: 1,
  });
};

export default sendStatusNotification;
