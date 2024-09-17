import { sleep } from '../../../../utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StopTransactionRequest } from 'schemas/ocpp/1.6/StopTransaction';

const sendStopTransaction: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  chargepoint.sessions[session.connectorId].isStoppingSession = true;

  chargepoint.sessions[session.connectorId].tickInterval?.stop();
  await sleep(1000);

  if (!session.stopTime) {
    throw new Error('stopTime must be set');
  }

  chargepoint.writeCall<StopTransactionRequest>(
    'StopTransaction',
    {
      idTag: session.options.uid,
      meterStop: Math.round(session.kwhElapsed * 1000),
      timestamp: session.stopTime.toISOString(),
      reason: 'EVDisconnected',
      transactionId: Number(session.transactionId),
      transactionData: [
        {
          timestamp: session.stopTime.toISOString(),
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
          timestamp: session.stopTime.toISOString(),
          sampledValue: [
            {
              value: session.stateOfCharge.toString(),
              context: 'Transaction.End',
              location: 'Outlet',
              unit: 'Percent',
              measurand: 'SoC',
            },
          ],
        },
      ],
    },
    session
  );
};

export default sendStopTransaction;
