import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';

export default async function handleTransactionEventReceived({
  chargepoint,
  emitter,
  session,
  callResultMessageBody,
}) {
  await sleep(1000);
  session.tickInterval = setInterval(() => {
    session.tick(5);
  }, 5000);
  await sleep(500);
  session.tick(0);

  emitter.emitEvent(EventTypes.Charging, { session });

  console.log('HERE8', session, chargepoint.sessions);
  if (chargepoint.sessions[session.connectorId]) {
    return;
  }
  console.log('HERE9');
  chargepoint.sessions[session.connectorId].isStartingSession = false;

  // chargepoint.sessions[session.connectorId].isStartingSession = false;
  // chargepoint.sessions[session.connectorId].isStoppingSession = true;
  // clearInterval(chargepoint.tickInterval);
  // await sleep(1000);

  // delete chargepoint.sessions[session.connectorId];
  // emitter.emitEvent(EventTypes.SessionCancelled, { session });
}
