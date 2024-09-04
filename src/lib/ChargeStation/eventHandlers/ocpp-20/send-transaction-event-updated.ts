import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { TransactionEventRequest } from 'schemas/ocpp/2.0/TransactionEventRequest';

import clock from '../../clock';
import {simulateKwhToStateOfCharge} from "lib/ChargeStation/utils";

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
      chargingState: session.suspended ? 'SuspendedEV' : 'Charging'
    },
    meterValue: [
      {
				timestamp: now.toISOString(),
				sampledValue: [
          {
            value: Number(session.kwhElapsed.toFixed(3)),
            context: 'Sample.Periodic',
            measurand: 'Energy.Active.Import.Register',
            location: 'Outlet',
            unitOfMeasure: { unit: 'kWh' },
          },
        ],
      },
			{
				timestamp: now.toISOString(),
				sampledValue: [
					{
						value: Number(simulateKwhToStateOfCharge(session.kwhElapsed).toFixed(2)),
						context: 'Sample.Periodic',
						measurand: 'SoC',
						location: 'Outlet',
						unitOfMeasure: { unit: 'Percent' }
					}
				]
			}
    ],
    evse: { id: 1, connectorId: session.connectorId },
  });
};

export default sendTransationEventUpdated;
