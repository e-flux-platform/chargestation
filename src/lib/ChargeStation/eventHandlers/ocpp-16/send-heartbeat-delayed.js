import { sleep } from '../../../../utils/csv';
import { EventTypes16 } from '../event-types';

export default async function sendHeartbeatDelayed({ chargepoint, emitter }) {
  const interval =
    parseInt(chargepoint.configuration['HeartbeatInterval'] || '30', 10) * 1000;

  await sleep(interval);
  if (chargepoint.connected) {
    await chargepoint.sendCommand('Heartbeat', {});
    emitter.emitEvent(EventTypes16.HeartbeatAccepted);
  }
}
