import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';

export default async function handleTokenRejection({
  chargepoint,
  emitter,
  session,
}) {
  if (chargepoint.sessions[session.connectorId]) {
    return;
  }

  chargepoint.sessions[session.connectorId].isStartingSession = false;
  chargepoint.sessions[session.connectorId].isStoppingSession = true;
  clearInterval(chargepoint.tickInterval);
  await sleep(1000);

  delete chargepoint.sessions[connectorId];
  emitter.emitEvent(EventTypes.SessionCancelled, { session });
}
