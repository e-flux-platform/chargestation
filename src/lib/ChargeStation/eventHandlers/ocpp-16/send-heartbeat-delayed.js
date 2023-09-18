import { sleep } from '../../../../utils/csv';

export default async function sendHeartbeatDelayed({ chargepoint }) {
  const interval =
    parseInt(chargepoint.configuration['HeartbeatInterval'] || '30', 10) * 1000;

  await sleep(interval);
  if (!chargepoint.connected) {
    return;
  }
  await chargepoint.writeCall('Heartbeat', {});
}
