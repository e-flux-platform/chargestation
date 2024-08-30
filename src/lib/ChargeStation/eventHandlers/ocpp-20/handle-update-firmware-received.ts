import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { sleep } from 'utils/csv';

import { UpdateFirmwareRequest } from 'schemas/ocpp/2.0/UpdateFirmwareRequest';
import { UpdateFirmwareResponse } from 'schemas/ocpp/2.0/UpdateFirmwareResponse';

const handleUpdateFirmwareReceived: ChargeStationEventHandler<
  UpdateFirmwareRequest,
  UpdateFirmwareResponse
> = async ({ chargepoint, callMessageId }) => {
  const sleepTime = 1000 * 2; // 2 seconds

  chargepoint.writeCallResult(callMessageId, { status: 'Accepted' });

  await sleep(sleepTime);

  await chargepoint.writeCall('FirmwareStatusNotification', {
    status: 'Downloading',
  });

  await sleep(sleepTime);

  await chargepoint.writeCall('FirmwareStatusNotification', {
    status: 'Downloaded',
  });

  await sleep(sleepTime);

  await chargepoint.writeCall('FirmwareStatusNotification', {
    status: 'Installing',
  });

  await sleep(sleepTime);

  chargepoint.firmwareVersion = `${
    chargepoint.firmwareVersion
  }+${new Date().getTime()}`;

  await chargepoint.writeCall('FirmwareStatusNotification', {
    status: 'Installed',
  });
};

export default handleUpdateFirmwareReceived;
