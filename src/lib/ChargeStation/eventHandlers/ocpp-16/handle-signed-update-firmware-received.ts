import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { sleep } from 'utils/csv';

import { SignedUpdateFirmwareRequest } from 'schemas/ocpp/1.6/SignedUpdateFirmware';
import { SignedUpdateFirmwareResponse } from 'schemas/ocpp/1.6/SignedUpdateFirmwareResponse';

const handleSignedUpdateFirmwareReceived: ChargeStationEventHandler<
  SignedUpdateFirmwareRequest,
  SignedUpdateFirmwareResponse
> = async ({ chargepoint, callMessageId }) => {
  const sleepTime = 1000 * 2; // 2 seconds

  const response: SignedUpdateFirmwareResponse = { status: 'Accepted' };
  chargepoint.writeCallResult(callMessageId, response);

  await sleep(sleepTime);

  await chargepoint.writeCall('SignedFirmwareStatusNotification', {
    status: 'Downloading',
  });

  await sleep(sleepTime);

  await chargepoint.writeCall('SignedFirmwareStatusNotification', {
    status: 'Downloaded',
  });

  await sleep(sleepTime);

  await chargepoint.writeCall('SignedFirmwareStatusNotification', {
    status: 'SignatureVerified',
  });

  await sleep(sleepTime);

  await chargepoint.writeCall('SignedFirmwareStatusNotification', {
    status: 'Installing',
  });

  await sleep(sleepTime);

  chargepoint.firmwareVersion = `${
    chargepoint.firmwareVersion
  }+${new Date().getTime()}`;

  await chargepoint.writeCall('SignedFirmwareStatusNotification', {
    status: 'Installed',
  });
};

export default handleSignedUpdateFirmwareReceived;
