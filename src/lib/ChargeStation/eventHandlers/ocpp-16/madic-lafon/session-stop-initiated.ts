import { sleep } from 'utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StopTransactionRequest } from 'schemas/ocpp/1.6/StopTransaction';
import sendStopTransaction from 'lib/ChargeStation/eventHandlers/ocpp-16/send-stop-transaction';
import { AuthorizationType } from 'lib/settings';

const sendStopTransactionWithCost: ChargeStationEventHandler = async (
  params
) => {
  const { chargepoint, session } = params;

  if (session.options.authorizationType !== AuthorizationType.CreditCard) {
    return sendStopTransaction(params);
  }

  chargepoint.sessions[session.connectorId].isStoppingSession = true;
  chargepoint.sessions[session.connectorId].tickInterval?.stop();

  await sleep(1000);

  // Calculations below are just general approximations of how costs may be applied.
  const priceTime = chargepoint.configuration.getVariableValue(
    'ChargePriceTime'
  ) as number;
  const priceEnergy = chargepoint.configuration.getVariableValue(
    'ChargePriceEnergy'
  ) as number;

  const startTime = session.startTime;
  const stopTime = session.stopTime as Date;
  const durationMinutes =
    (stopTime.getTime() - startTime.getTime()) / 1000 / 60;

  const durationCost = durationMinutes * priceTime;
  const kWhCost = session.kwhElapsed * priceEnergy;
  const sessionCost = durationCost + kWhCost;

  chargepoint.writeCall<StopTransactionRequest>(
    'StopTransaction',
    {
      idTag: session.options.uid,
      meterStop: Math.round(session.kwhElapsed * 1000),
      timestamp: stopTime.toISOString(),
      reason: 'EVDisconnected',
      transactionId: Number(session.transactionId),
      transactionData: [
        {
          timestamp: stopTime.toISOString(),
          sampledValue: [
            {
              value: sessionCost.toFixed(2),
              context: 'Transaction.End',
              location: 'Body',
              unit: 'Celcius',
              format: 'Raw',
              measurand: 'Temperature',
            },
          ],
        },
      ],
    },
    session
  );
};

export default sendStopTransactionWithCost;
