import { sleep } from '../../../../utils/csv';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

const sendHeartbeat: ChargeStationEventHandler = async ({ chargepoint }) => {
  await sleep(1000);
  await chargepoint.writeCall('Heartbeat', {});
};

export default sendHeartbeat;
