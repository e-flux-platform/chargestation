import { sleep } from '../../../../utils/csv';

export default async function sendHeartbeat({ chargepoint }) {
  await sleep(1000);
  await chargepoint.writeCall('Heartbeat', {});
}
