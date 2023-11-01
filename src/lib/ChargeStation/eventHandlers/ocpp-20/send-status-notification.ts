import { sleep } from '../../../../utils/csv';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

const sendStatusNotification: ChargeStationEventHandler = async ({
  chargepoint,
}) => {
  await sleep(1000);

  chargepoint.writeCall('StatusNotification', {
    timestamp: new Date().toISOString(),
    connectorStatus: 'Available',
    evseId: 0,
    connectorId: 0,
  });

  await sleep(1000);

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
};

export default sendStatusNotification;
