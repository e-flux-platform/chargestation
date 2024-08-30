import { sleep } from '../../../../utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { ChargeStationSetting } from 'lib/settings';

import { BootNotificationRequest } from 'schemas/ocpp/1.6/BootNotification';
import { BootNotificationResponse } from 'schemas/ocpp/1.6/BootNotificationResponse';

const sendBootNotification: ChargeStationEventHandler<
  BootNotificationRequest,
  BootNotificationResponse
> = async ({ chargepoint }) => {
  await sleep(2000);

  chargepoint.writeCall('BootNotification', {
    chargePointVendor: chargepoint.getSetting(
      ChargeStationSetting.ChargePointVendor
    ),
    chargePointModel: chargepoint.getSetting(
      ChargeStationSetting.ChargePointModel
    ),
    chargePointSerialNumber: chargepoint.getSetting(
      ChargeStationSetting.ChargePointSerialNumber
    ),
    chargeBoxSerialNumber: chargepoint.configuration.getOCPPIdentityString(),
    firmwareVersion: chargepoint.firmwareVersion,
    iccid: chargepoint.getSetting(ChargeStationSetting.ICCID),
    imsi: chargepoint.getSetting(ChargeStationSetting.IMSI),
  });
};

export default sendBootNotification;
