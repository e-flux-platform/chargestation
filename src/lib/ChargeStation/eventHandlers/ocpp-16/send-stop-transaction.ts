import { sleep } from '../../../../utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StopTransactionRequest } from 'schemas/ocpp/1.6/StopTransaction';
import {
  signOcpp16TransactionEnd,
  signOcpp16TransactionStart,
} from 'lib/ChargeStation/ocmf';

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

  const havePrivateKey = chargepoint.settings.privateKey !== '';
  const ocmfSigFormat = chargepoint.configuration.getVariableValue(
    'StopTransactionSignatureFormat'
  );

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
          timestamp: session.startTime.toISOString(),
          sampledValue: [
            {
              value: '0',
              context: 'Transaction.Begin',
              format: 'Raw',
              measurand: 'Energy.Active.Import.Register',
              location: 'Outlet',
              unit: 'kWh',
            },
            ...(havePrivateKey && ocmfSigFormat === 'SR'
              ? [await signOcpp16TransactionStart(session, chargepoint)]
              : []),
          ],
        },
        {
          timestamp: session.stopTime.toISOString(),
          sampledValue: [
            {
              value: session.kwhElapsed.toString(),
              context: 'Transaction.End',
              format: 'Raw',
              measurand: 'Energy.Active.Import.Register',
              location: 'Outlet',
              unit: 'kWh',
            },
            {
              value: session.stateOfCharge.toString(),
              context: 'Transaction.End',
              location: 'Outlet',
              unit: 'Percent',
              measurand: 'SoC',
            },
            ...(havePrivateKey
              ? [await signOcpp16TransactionEnd(session, chargepoint)]
              : []),
          ],
        },
      ],
    },
    session
  );
};

export default sendStopTransaction;
