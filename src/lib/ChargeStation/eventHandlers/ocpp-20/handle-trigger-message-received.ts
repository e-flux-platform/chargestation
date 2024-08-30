import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { sleep } from 'utils/csv';

import { TriggerMessageRequest } from 'schemas/ocpp/2.0/TriggerMessageRequest';
import { TriggerMessageResponse } from 'schemas/ocpp/2.0/TriggerMessageResponse';

const handleTriggerMessageReceived: ChargeStationEventHandler<
  TriggerMessageRequest,
  TriggerMessageResponse
> = async (params) => {
  const sleepTime = 1000 * 2; // 2 seconds
  const { chargepoint, callMessageId, callMessageBody } = params;

  switch (callMessageBody.requestedMessage) {
    case 'BootNotification':
      chargepoint.writeCallResult(callMessageId, {
        status: 'Accepted',
      });
      await sleep(sleepTime);
      chargepoint.writeCall('BootNotification', {
        reason: 'Triggered',
        chargingStation: {
          serialNumber: chargepoint.settings.chargePointSerialNumber,
          model: chargepoint.settings.chargePointModel,
          vendorName: chargepoint.settings.chargePointVendor,
          firmwareVersion: chargepoint.firmwareVersion,
        },
      });
      break;
    default:
      chargepoint.writeCallResult(callMessageId, {
        status: 'NotImplemented',
      });
  }
};

export default handleTriggerMessageReceived;
