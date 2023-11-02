import { sleep } from '../../../../utils/csv';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

const sendStopTransaction: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  chargepoint.sessions[session.connectorId].isStoppingSession = true;

  clearInterval(session.tickInterval);
  await sleep(1000);

  const now = new Date().toISOString();

  await chargepoint.writeCall(
    'TransactionEvent',
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
              value: 0.0,
              context: 'Transaction.Begin',
              unitOfMeasure: { unit: 'kWh' },
            },
          ],
          timestamp: session.startTime.toISOString(),
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

  sleep(1000);

  await chargepoint.writeCall('StatusNotification', {
    timestamp: new Date().toISOString(),
    connectorStatus: 'Available',
    evseId: 1,
    connectorId: session.connectorId,
  });
};

export default sendStopTransaction;
