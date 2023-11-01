import { sleep } from '../../../../utils/csv';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

const sendHeartbeatDelayed: ChargeStationEventHandler = async ({
  chargepoint,
}) => {
  const interval = 30_000; // 30 seconds

  await sleep(interval);
  if (!chargepoint.connected) {
    return;
  }
  await chargepoint.writeCall('Heartbeat', {});
};

export default sendHeartbeatDelayed;
