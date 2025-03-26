import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { Session } from 'lib/ChargeStation';

const handleTokenRejection: ChargeStationEventHandler = async ({
  chargepoint,
  emitter,
  session,
}) => {
  if (!session || !chargepoint.sessions[session.connectorId]) {
    return;
  }

  chargepoint.sessions[session.connectorId].isStartingSession = false;
  chargepoint.sessions[session.connectorId].isStoppingSession = true;

  await sleep(1000);

  delete chargepoint.sessions[session.connectorId];
  emitter.emitEvent(EventTypes.SessionCancelled, { session });
};

export default handleTokenRejection;
