import { sleep } from '../../../../utils/csv';
import { EventTypes16 } from '../event-types';

export default async function sendStartTransaction({
  chargepoint,
  emitter,
  session,
}) {
  chargepoint.sessions[session.connectorId].isStartingSession = true;

  await sleep(1000);
  const startTransactionResponse = await session.options.sendCommand(
    'StartTransaction',
    {
      connectorId: session.connectorId,
      idTag: session.options.uid,
      meterStart: Math.round(session.kwhElapsed * 1000),
      timestamp: session.now().toISOString(),
      reservationId: undefined,
    }
  );

  await sleep(1000);
  if (startTransactionResponse.idTagInfo.status === 'Invalid') {
    emitter.emitEvent(
      EventTypes16.AuthorizationFailedDuringStartTransaction,
      session
    );
    return;
  }
  session.transactionId = startTransactionResponse.transactionId;
  chargepoint.sessions[session.connectorId].isStartingSession = false;

  emitter.emitEvent(EventTypes16.StartTransactionAccepted, session);
}
