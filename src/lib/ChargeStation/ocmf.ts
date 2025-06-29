import ChargeStation, { Session } from 'lib/ChargeStation/index';
import { Crypto } from '@road-labs/ocmf-crypto-noble';
import { formatDate, PayloadData, Signer } from '@road-labs/ocmf';

type Options = {
  includeStart?: boolean;
  includeEnd?: boolean;
};

const ocmfCrypto = new Crypto();
const ocmfSigner = new Signer(ocmfCrypto);

export const signMeterReadings = async (
  chargepoint: ChargeStation,
  session: Session,
  opts: Options
) => {
  if (!chargepoint.settings.privateKey) {
    throw new Error('Private key not set');
  }
  if (!chargepoint.settings.ocmfSignatureMethod) {
    throw new Error('Signature method not set');
  }
  const privateKey = await ocmfCrypto.decodeEcPrivateKey(
    hexToBytes(chargepoint.settings.privateKey),
    'pkcs8-der'
  );
  return ocmfSigner.sign(
    buildDataSection(session, opts),
    privateKey,
    chargepoint.settings.ocmfSignatureMethod
  );
};

export const getPublicKey = async (
  chargepoint: ChargeStation
): Promise<string | undefined> => {
  if (!chargepoint.settings.privateKey) {
    throw new Error('Private key not set');
  }
  const privateKey = await ocmfCrypto.decodeEcPrivateKey(
    hexToBytes(chargepoint.settings.privateKey),
    'pkcs8-der'
  );
  const publicKey = privateKey.getPublicKey();
  if (publicKey) {
    return bytesToHex(publicKey.encode('spki-der'));
  }
};

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

const hexToBytes = (hex: string): Uint8Array => {
  if (
    hex.length === 0 ||
    hex.length % 2 !== 0 ||
    !hex.match(/^[A-Za-f0-9]+$/)
  ) {
    throw new Error('Invalid hex string');
  }
  const bytes = hex.match(/.{2}/g)?.map((byte) => parseInt(byte, 16));
  if (!bytes) {
    throw new Error('Failed to map hex string');
  }
  return new Uint8Array(bytes);
};

const ocmfDate = (d: Date): string => {
  return formatDate(d, 'S');
};

const buildDataSection = (session: Session, opts: Options): PayloadData => ({
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
  ] as PayloadData['RD'],
});
