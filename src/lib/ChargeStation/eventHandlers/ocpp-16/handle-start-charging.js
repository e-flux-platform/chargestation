import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';
import clock from '../../clock';

export default async function handleStartCharging({ emitter, session }) {
  await sleep(1000);
  let timeSince = clock.now();

  session.tickInterval = clock.setInterval(() => {
    session.tick(clock.secondsSince(timeSince));
    timeSince = clock.now();
  }, 5000)

  await sleep(500);
  session.tick(0);

  emitter.emitEvent(EventTypes.Charging, { session });
}
