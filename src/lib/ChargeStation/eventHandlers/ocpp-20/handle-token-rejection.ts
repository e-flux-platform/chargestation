import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

const handleTokenRejection: ChargeStationEventHandler = async ({
  chargepoint,
  emitter,
  session,
}) => {
  const chargeSession = chargepoint.sessions[session.connectorId];
  if (!session) {
    return;
  }

  chargeSession.isStartingSession = false;
  chargeSession.isStoppingSession = true;
  chargeSession.tickInterval?.stop();
  await sleep(1000);

  delete chargepoint.sessions[chargeSession.connectorId];
  emitter.emitEvent(EventTypes.SessionCancelled, { session: chargeSession });
};

export default handleTokenRejection;
