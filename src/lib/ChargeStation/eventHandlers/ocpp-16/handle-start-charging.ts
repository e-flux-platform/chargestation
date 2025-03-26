import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';
import clock from '../../clock';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { Session } from 'lib/ChargeStation';

const handleStartCharging: ChargeStationEventHandler = async ({
  emitter,
  session,
}) => {
  await sleep(1000);
  let timeSince = clock.now();

  if (session) {
    session.tickInterval = clock.setInterval(() => {
      session.tick(clock.secondsSince(timeSince));
      timeSince = clock.now();
    }, 1000);

    await sleep(500);
    session.tick(0);

    emitter.emitEvent(EventTypes.Charging, { session });
  }
};

export default handleStartCharging;
