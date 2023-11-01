import { sleep } from '../../../../utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { ChargeStationSetting } from 'lib/settings';

const sendBootNotification: ChargeStationEventHandler = async ({
  chargepoint,
}) => {
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
    firmwareVersion: 'v1-000',
    iccid: chargepoint.getSetting(ChargeStationSetting.ICCID),
    imsi: chargepoint.getSetting(ChargeStationSetting.IMSI),
  });
};

export default sendBootNotification;
