import { sleep } from '../../../../utils/csv';
import { EventTypes16 } from '../event-types';

export default async function sendStopTransaction({ chargepoint, session }) {
  chargepoint.sessions[session.connectorId].isStoppingSession = true;

  clearInterval(session.tickInterval);
  await sleep(1000);

  const now = new Date().toISOString();

  await chargepoint.writeCall(
    'StopTransaction',
    {
      eventType: 'Ended',
      timestamp: now,
      triggerReason: 'StopAuthorized',
      seqNo: session.seqNo,
      transactionInfo: {
        transactionId: session.transactionId,
        chargingState: 'Charging',
      },
      meterValue: [
        {
          sampledValue: [
            {
              value: 0, // TODO
              context: 'Transaction.Begin',
              unitOfMeasure: { unit: 'kWh' },
            },
          ],
          timestamp: '2023-10-12T07:43:35Z', // TODO
        },
        {
          sampledValue: [
            {
              value: session.kwhElapsed,
              context: 'Transaction.End',
              unitOfMeasure: { unit: 'kWh' },
            },
          ],
          timestamp: now,
        },
      ],
      evse: { id: 1, connectorId: session.connectorId },
      idToken: { idToken: session.options.uid, type: 'ISO14443' },
    },
    session
  );
}
