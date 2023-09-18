import { sleep } from '../../../../utils/csv';
import { EventTypes16 } from '../event-types';

export default async function sendHeartbeat({ chargepoint, emitter }) {
  await sleep(1000);
  await chargepoint.sendCommand('Heartbeat', {});
  emitter.emitEvent(EventTypes16.HeartbeatAccepted);
}
