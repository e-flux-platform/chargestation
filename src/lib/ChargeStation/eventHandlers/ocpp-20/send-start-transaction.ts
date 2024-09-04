import { v4 as uuidv4 } from 'uuid';

import { sleep } from 'utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import clock from '../../clock';

const sendStartTransaction: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  chargepoint.sessions[session.connectorId].isStartingSession = true;
  await sleep(1000);

  const evseId = 1;
  const connectorId = session.connectorId;

  chargepoint.writeCall('StatusNotification', {
    timestamp: clock.now().toISOString(),
    connectorStatus: 'Occupied',
    evseId,
    connectorId,
  });

  await sleep(1000);

  const startTime = session.startTime.toISOString();
  const transactionId = uuidv4();
  session.transactionId = transactionId;
  session.isStartingSession = true;

  chargepoint.writeCall(
    'TransactionEvent',
    {
      eventType: 'Started',
      timestamp: startTime,
      triggerReason: 'ChargingStateChanged',
      seqNo: session.seqNo,
      transactionInfo: {
        transactionId: session.transactionId,
        chargingState: 'SuspendedEVSE',
      },
      meterValue: [
        {
					timestamp: startTime,
					sampledValue: [
            {
              value: Math.round(session.kwhElapsed * 1000),
              context: 'Transaction.Begin',
              unitOfMeasure: { unit: 'kWh' },
            },

          ],
        },
				{
					timestamp: startTime,
					sampledValue: [
						{
							value: 0,
							context: 'Transaction.Begin',
							unitOfMeasure: { unit: 'Percent' },
							measurand: 'SoC',
						}
					]
				}
      ],
      evse: { id: evseId, connectorId },
      idToken: { idToken: session.options.uid, type: 'ISO14443' },
      remoteStartId: session.options.remoteStartId,
    },
    session
  );
};

export default sendStartTransaction;
