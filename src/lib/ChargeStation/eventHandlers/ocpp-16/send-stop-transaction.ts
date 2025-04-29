import { sleep } from '../../../../utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StopTransactionRequest } from 'schemas/ocpp/1.6/StopTransaction';
import { signMeterReadings } from 'lib/ChargeStation/ocmf';
import ChargeStation, { Session } from 'lib/ChargeStation';

type Ocpp16SampledValue =
  StopTransactionRequest['transactionData'][0]['sampledValue'][0];

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
              location: 'EV',
              unit: 'Percent',
              measurand: 'SoC',
            },
            ...(havePrivateKey
              ? [
                  await signOcpp16TransactionEnd(
                    session,
                    chargepoint,
                    ocmfSigFormat === 'MR'
                  ),
                ]
              : []),
          ],
        },
      ],
    },
    session
  );
};

const signOcpp16TransactionStart = async (
  session: Session,
  chargepoint: ChargeStation
): Promise<Ocpp16SampledValue> =>
  buildOcmfSampledValue(
    await signMeterReadings(chargepoint, session, { includeStart: true }),
    'Transaction.Begin'
  );

const signOcpp16TransactionEnd = async (
  session: Session,
  chargepoint: ChargeStation,
  includeStart: boolean
): Promise<Ocpp16SampledValue> =>
  buildOcmfSampledValue(
    await signMeterReadings(chargepoint, session, {
      includeStart,
      includeEnd: true,
    }),
    'Transaction.End'
  );

const buildOcmfSampledValue = (
  signedData: string,
  context: string
): Ocpp16SampledValue => ({
  value: signedData,
  context,
  format: 'SignedData',
  measurand: 'Energy.Active.Import.Register',
  unit: 'Wh',
});

export default sendStopTransaction;
