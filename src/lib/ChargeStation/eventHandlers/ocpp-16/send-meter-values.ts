import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { MeterValuesRequest } from 'schemas/ocpp/1.6/MeterValues';
import clock from 'lib/ChargeStation/clock';
import {simulateKwhToStateOfCharge} from "lib/ChargeStation/utils";


const sendMeterValues: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  const now = clock.now()

	chargepoint.writeCall<MeterValuesRequest>('MeterValues', {
    connectorId: session.connectorId,
    transactionId: Number(session.transactionId),
    meterValue: [
      {
        timestamp: now.toISOString(),
        sampledValue: [
          {
            value: session.kwhElapsed.toFixed(5),
            context: 'Sample.Periodic',
            measurand: 'Energy.Active.Import.Register',
            location: 'Outlet',
            unit: 'kWh',
          },
        ],
      },
			{
				timestamp: now.toISOString(),
				sampledValue: [
					{
						value: simulateKwhToStateOfCharge(session.kwhElapsed).toFixed(2),
						context: 'Sample.Periodic',
						measurand: 'SoC',
						location: 'Outlet',
						unit: 'Percent'
					}
				]
			}
    ],
  });
};

export default sendMeterValues;
