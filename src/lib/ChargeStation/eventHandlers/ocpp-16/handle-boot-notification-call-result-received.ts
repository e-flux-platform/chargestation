import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { BootNotificationRequest } from 'schemas/ocpp/1.6/BootNotification';
import { BootNotificationResponse } from 'schemas/ocpp/1.6/BootNotificationResponse';

const handleBootNotificationCallResultReceived: ChargeStationEventHandler<
  BootNotificationRequest,
  BootNotificationResponse
> = async ({ emitter }) => {
  // TODO: Handle rejections

  emitter.emitEvent(EventTypes.BootNotificationAccepted);
};

export default handleBootNotificationCallResultReceived;
