import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { TransactionEventRequest } from 'schemas/ocpp/2.0/TransactionEventRequest';

const sendTransationEventUpdated: ChargeStationEventHandler = ({
  chargepoint,
  session,
}) => {
  const now = clock.now();

  chargepoint.writeCall<TransactionEventRequest>('TransactionEvent', {
    eventType: 'Updated',
    timestamp: now.toISOString(),
    triggerReason: 'MeterValuePeriodic',
    seqNo: session.seqNo,
    transactionInfo: {
      transactionId: session.transactionId,
    },
    meterValue: [
      {
        sampledValue: [
          {
            value: Number(session.kwhElapsed.toFixed(3)),
            context: 'Sample.Periodic',
            measurand: 'Energy.Active.Import.Register',
            location: 'Outlet',
            unitOfMeasure: { unit: 'kWh' },
          },
        ],
        timestamp: now.toISOString(),
      },
    ],
    evse: { id: 1, connectorId: session.connectorId },
  });
};

export default sendTransationEventUpdated;
