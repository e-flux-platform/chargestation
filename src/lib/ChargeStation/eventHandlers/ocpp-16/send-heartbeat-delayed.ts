import { sleep } from '../../../../utils/csv';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import clock from 'lib/ChargeStation/clock';

const sendHeartbeatDelayed: ChargeStationEventHandler = async ({
  chargepoint,
}) => {
  await sleep(
    clock.adjustBySpeed(chargepoint.configuration.getHeartbeatInterval())
  );
  if (!chargepoint.connected) {
    return;
  }
  await chargepoint.writeCall('Heartbeat', {});
};

export default sendHeartbeatDelayed;
