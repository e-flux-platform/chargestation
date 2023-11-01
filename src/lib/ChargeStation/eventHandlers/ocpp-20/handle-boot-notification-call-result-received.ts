import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { BootNotificationRequest } from 'schemas/ocpp/2.0/BootNotificationRequest';
import { BootNotificationResponse } from 'schemas/ocpp/2.0/BootNotificationResponse';

const handleBootNotificationCallResultReceived: ChargeStationEventHandler<
  BootNotificationRequest,
  BootNotificationResponse
> = ({ emitter }) => {
  emitter.emitEvent(EventTypes.BootNotificationAccepted);
};

export default handleBootNotificationCallResultReceived;
