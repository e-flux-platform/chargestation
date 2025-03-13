import { ec as EC } from 'elliptic';
import ChargeStation, { Session } from 'lib/ChargeStation/index';

const curveToIdentifier: Record<Curve, string> = {
  secp192k1: 'ECDSA-secp192k1-SHA256',
  secp256k1: 'ECDSA-secp256k1-SHA256',
  secp192r1: 'ECDSA-secp192r1-SHA256',
  secp256r1: 'ECDSA-secp256r1-SHA256',
  brainpool256r1: 'ECDSA-brainpool256r1-SHA256',
  secp384r1: 'ECDSA-secp384r1-SHA256',
  brainpool384r1: 'ECDSA-brainpool384r1-SHA256',
};

const defaultCurve = 'secp256k1';

type Curve =
  | 'secp192k1'
  | 'secp256k1'
  | 'secp192r1'
  | 'secp256r1'
  | 'brainpool256r1'
  | 'secp384r1'
  | 'brainpool384r1';

type Options = {
  includeStart?: boolean;
  includeEnd?: boolean;
  curve?: Curve;
};

export const signMeterReadings = async (
  chargepoint: ChargeStation,
  session: Session,
  opts: Options
) => {
  const dataSection = JSON.stringify(buildDataSection(session, opts));

  const privateKey = chargepoint.settings.privateKey || '';
  const curve = opts.curve || defaultCurve;
  const signature = await signMessage(privateKey, dataSection, curve);
  const signatureSection = JSON.stringify(
    buildSignatureSection(signature, curve)
  );

  return ['OCMF', dataSection, signatureSection].join('|');
};

const ocmfDate = (d: Date): string => {
  const date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const time = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()},${d.getMilliseconds()}`;
  const offset = d.getTimezoneOffset() <= 0 ? '+' : '-';
  const tz = `${(Math.abs(d.getTimezoneOffset()) / 60) * 100}`.padStart(4, '0');
  return `${date}T${time}${offset}${tz}`;
};

const signMessage = async (
  privateKey: string,
  message: string,
  curve: string
) => {
  const ec = new EC(curve);
  const key = ec.keyFromPrivate(privateKey);
  const msgUint8 = new TextEncoder().encode(message);
  const shaMsg = await crypto.subtle.digest('SHA-256', msgUint8);
  return ec.sign(new Uint8Array(shaMsg), key).toDER('hex');
};

const buildDataSection = (session: Session, opts: Options) => ({
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
});

const buildSignatureSection = (signature: string, curve: Curve) => ({
  SA: curveToIdentifier[curve],
  SE: 'hex',
  SM: 'application/x-der',
  SD: signature,
});
