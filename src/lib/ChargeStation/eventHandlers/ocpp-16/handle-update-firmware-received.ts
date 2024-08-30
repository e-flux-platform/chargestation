import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { sleep } from 'utils/csv';

import { UpdateFirmwareRequest } from 'schemas/ocpp/1.6/UpdateFirmware';
import { UpdateFirmwareResponse } from 'schemas/ocpp/1.6/UpdateFirmwareResponse';

const handleUpdateFirmwareReceived: ChargeStationEventHandler<
  UpdateFirmwareRequest,
  UpdateFirmwareResponse
> = async ({ chargepoint, callMessageId }) => {
  const sleepTime = 1000 * 2; // 2 seconds

  chargepoint.writeCallResult(callMessageId, {});

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

  await chargepoint.writeCall('FirmwareStatusNotification', {
    status: 'Installed',
  });

  chargepoint.firmwareVersion = `${
    chargepoint.firmwareVersion
  }+${new Date().getTime()}`;
};

export default handleUpdateFirmwareReceived;
