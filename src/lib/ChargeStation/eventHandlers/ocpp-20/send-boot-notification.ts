import { sleep } from '../../../../utils/csv';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { BootNotificationRequest } from 'schemas/ocpp/2.0/BootNotificationRequest';
import { BootNotificationResponse } from 'schemas/ocpp/2.0/BootNotificationResponse';

const sendBootNotification: ChargeStationEventHandler<
  BootNotificationRequest,
  BootNotificationResponse
> = async ({ chargepoint }) => {
  await sleep(2000);

  chargepoint.writeCall('BootNotification', {
    reason: 'PowerUp',
    chargingStation: {
      serialNumber: chargepoint.settings.chargePointSerialNumber,
      model: chargepoint.settings.chargePointModel,
      vendorName: chargepoint.settings.chargePointVendor,
      firmwareVersion: 'v1-000',
    },
  });
};

export default sendBootNotification;
