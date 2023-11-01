import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { HeartbeatRequest } from 'schemas/ocpp/2.0/HeartbeatRequest';
import { HeartbeatResponse } from 'schemas/ocpp/2.0/HeartbeatResponse';

const handleHeartbeatCallResultReceived: ChargeStationEventHandler<
  HeartbeatRequest,
  HeartbeatResponse
> = ({ emitter }) => {
  emitter.emitEvent(EventTypes.HeartbeatAccepted);
};

export default handleHeartbeatCallResultReceived;
