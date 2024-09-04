import { sleep } from '../../../../utils/csv';
import {simulateStateOfChargeFromKwh} from "lib/ChargeStation/utils";

export default async function sendStopTransaction({ chargepoint, session }) {
  chargepoint.sessions[session.connectorId].isStoppingSession = true;

  chargepoint.sessions[session.connectorId].tickInterval?.stop();
  await sleep(1000);

  await chargepoint.writeCall(
    'StopTransaction',
    {
      idTag: session.options.uid,
      meterStop: Math.round(session.kwhElapsed * 1000),
      timestamp: session.now().toISOString(),
      reason: 'EVDisconnected',
      transactionId: Number(session.transactionId),
      transactionData: [
        {
					timestamp: session.now().toISOString(),
					sampledValue: [
            {
              value: session.kwhElapsed.toString(),
              context: 'Sample.Periodic',
              format: 'Raw',
              measurand: 'Energy.Active.Import.Register',
              location: 'Outlet',
              unit: 'kWh',
            },
          ],
        },
				{
					timestamp: session.now().toISOString(),
					sampledValue: [
						{
							value: simulateStateOfChargeFromKwh(session.kwhElapsed).toFixed(2),
							context: 'Transaction.End',
							unitOfMeasure: { unit: 'Percent' },
							measurand: 'SoC',
						}
					]
				}
      ],
    },
    session
  );
}
