import { sleep } from '../../../../utils/csv';
import { EventTypes16 } from '../event-types';

export default async function handleStartCharging(
  chargepoint,
  emitter,
  session
) {
  await sleep(1000);
  session.tickInterval = setInterval(() => {
    session.tick(5);
  }, 5000);
  await sleep(500);
  session.tick(0);

  emitter.emitEvent(EventTypes16.Charging, session);
}
