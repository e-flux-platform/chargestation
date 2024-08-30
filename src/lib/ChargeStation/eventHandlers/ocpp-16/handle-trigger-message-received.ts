import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { sleep } from 'utils/csv';

import { TriggerMessageRequest } from 'schemas/ocpp/1.6/TriggerMessage';
import { TriggerMessageResponse } from 'schemas/ocpp/1.6/TriggerMessageResponse';
import sendBootNotification from './send-boot-notification';

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
      await sendBootNotification(params as any);
      break;
    default:
      chargepoint.writeCallResult(callMessageId, {
        status: 'NotImplemented',
      });
  }
};

export default handleTriggerMessageReceived;
