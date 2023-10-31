import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';

export default async function handleTransactionEventCallResultReceived({
  session,
  emitter,
  chargepoint,
  callMessageBody,
}) {
  switch (callMessageBody.eventType) {
    case 'Started':
      session.isStartingSession = false;

      await sleep(1000);
      session.tickInterval = setInterval(() => {
        session.tick(5);
      }, 5000);
      await sleep(500);
      session.tick(0);

      emitter.emitEvent(EventTypes.Charging);
      break;
    case 'Updated':
      emitter.emitEvent(EventTypes.Charging);
      break;
    case 'Ended':
      delete chargepoint.sessions[session.connectorId];
      break;
  }
}
