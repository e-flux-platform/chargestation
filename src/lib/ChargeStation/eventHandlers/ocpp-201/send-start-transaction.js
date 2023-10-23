import { v4 as uuidv4 } from 'uuid';

import { sleep } from '../../../../utils/csv';

export default async function sendStartTransaction({ chargepoint, session }) {
  chargepoint.sessions[session.connectorId].isStartingSession = true;
  await sleep(1000);

  const evseId = 1;
  const connectorId = 1;

  chargepoint.writeCall('StatusNotification', {
    timestamp: new Date().toISOString(),
    connectorStatus: 'Occupied',
    evseId,
    connectorId,
  });

  await sleep(1000);

  const now = new Date().toISOString();
  const transactionId = uuidv4();
  session.transactionId = transactionId;

  await chargepoint.writeCall(
    'TransactionEvent',
    {
      eventType: 'Started',
      timestamp: now,
      triggerReason: 'ChargingStateChanged',
      seqNo: session.seqNo,
      transactionInfo: {
        transactionId: session.transactionId,
        chargingState: 'SuspendedEVSE',
      },
      meterValue: [
        {
          sampledValue: [
            {
              value: Math.round(session.kwhElapsed * 1000),
              context: 'Transaction.Begin',
              unitOfMeasure: { unit: 'kWh' },
            },
          ],
          timestamp: now,
        },
      ],
      evse: { id: evseId, connectorId },
      idToken: { idToken: session.options.uid, type: 'ISO14443' },
    },
    session
  );
}
