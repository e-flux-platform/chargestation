import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { getPublicKey } from 'lib/ChargeStation/ocmf';
import { sleep } from 'utils/csv';

export const sendMeterConfiguration: ChargeStationEventHandler = async (
  params
) => {
  const { chargepoint } = params;

  if (!chargepoint.settings.privateKey) {
    return;
  }

  const publicKey = await getPublicKey(chargepoint);
  if (!publicKey) {
    return;
  }

  const hexPublicKey = bytesToHex(publicKey);

  await sleep(2000);

  for (const connectorId of [1, 2]) {
    chargepoint.writeCall('DataTransfer', {
      vendorId: 'generalConfiguration',
      messageId: 'setMeterConfiguration',
      data: JSON.stringify({
        meters: [
          {
            connectorId,
            meterSerial: '1234567',
            type: 'SIGNATURE',
            publicKey: hexPublicKey,
          },
        ],
      }),
    });
    await sleep(200);
  }
};

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};
