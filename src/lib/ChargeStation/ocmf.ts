import { ec as EC } from 'elliptic';
import ChargeStation, { Session } from 'lib/ChargeStation/index';
import { StopTransactionRequest } from 'schemas/ocpp/1.6/StopTransaction';

type Ocpp16SampledValue =
  StopTransactionRequest['transactionData'][0]['sampledValue'][0];

const ocmfDate = (d: Date): string => {
  const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()},${d.getMilliseconds()}`;
  const offset = d.getTimezoneOffset() <= 0 ? '+' : '-';
  const tz = `${(Math.abs(d.getTimezoneOffset()) / 60) * 100}`.padStart(4, '0');
  return `${date}T${time}${offset}${tz}`;
};

const signMessage = async (privateKey: string, message: string) => {
  const secp256k1 = new EC('secp256k1');
  const key = secp256k1.keyFromPrivate(privateKey);
  const msgUint8 = new TextEncoder().encode(message);
  const shaMsg = await crypto.subtle.digest('SHA-256', msgUint8);
  return secp256k1.sign(new Uint8Array(shaMsg), key).toDER('hex');
};

const buildOcmfSampledValue = async (
  chargepoint: ChargeStation,
  dataSection: string,
  context: string
): Promise<Ocpp16SampledValue> => {
  const privateKey = chargepoint.settings.privateKey || '';
  const signature = await signMessage(privateKey, dataSection);

  const signatureSection = JSON.stringify({
    SE: 'hex',
    SM: 'application/x-der',
    SD: signature,
  });

  return {
    value: ['OCMF', dataSection, signatureSection].join('|'),
    context,
    format: 'SignedData',
    measurand: 'Energy.Active.Import.Register',
    unit: 'Wh',
  };
};

const buildOcmfDataSection = (
  session: Session,
  opts: { includeStart?: boolean; includeEnd?: boolean }
) => {
  return {
    FV: '1.0',
    GI: '123',
    GS: '000',
    GV: '1.0',
    PG: 'P1',
    MV: 'CS1',
    MM: 'CSOneMeter',
    MS: '111',
    MF: '1.0',
    IS: true,
    IT: 'ISO14443',
    ID: session.options.uid,
    RD: [
      ...(opts.includeStart
        ? [
            {
              TM: ocmfDate(session.startTime),
              TX: 'B',
              RV: 0,
              RI: '1-0:1.8.2',
              RU: 'kWh',
              RT: 'DC',
              EF: '',
              ST: 'G',
            },
          ]
        : []),
      ...(opts.includeEnd
        ? [
            {
              TM: ocmfDate(session.stopTime as Date),
              TX: 'E',
              RV: session.kwhElapsed,
              RI: '1-0:1.8.2',
              RU: 'kWh',
              RT: 'DC',
              EF: '',
              ST: 'G',
            },
          ]
        : []),
    ],
  };
};

export const signOcpp16TransactionStart = async (
  session: Session,
  chargepoint: ChargeStation
): Promise<Ocpp16SampledValue> => {
  const dataSection = JSON.stringify(
    buildOcmfDataSection(session, { includeStart: true })
  );

  return buildOcmfSampledValue(chargepoint, dataSection, 'Transaction.Begin');
};

export const signOcpp16TransactionEnd = async (
  session: Session,
  chargepoint: ChargeStation
): Promise<Ocpp16SampledValue> => {
  const includeStart =
    chargepoint.configuration.getVariableValue(
      'StopTransactionSignatureFormat'
    ) === 'MR';

  const dataSection = JSON.stringify(
    buildOcmfDataSection(session, {
      includeStart: includeStart,
      includeEnd: true,
    })
  );

  return buildOcmfSampledValue(chargepoint, dataSection, 'Transaction.End');
};
