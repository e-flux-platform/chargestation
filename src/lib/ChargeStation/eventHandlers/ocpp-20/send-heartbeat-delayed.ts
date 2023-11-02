import { sleep } from '../../../../utils/csv';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

const sendHeartbeatDelayed: ChargeStationEventHandler = async ({
  chargepoint,
}) => {
  await sleep(chargepoint.configuration.getHeartbeatInterval());
  if (!chargepoint.connected) {
    return;
  }
  await chargepoint.writeCall('Heartbeat', {});
};

export default sendHeartbeatDelayed;
