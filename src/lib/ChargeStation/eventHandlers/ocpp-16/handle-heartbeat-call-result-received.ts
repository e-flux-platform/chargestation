import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { HeartbeatRequest } from 'schemas/ocpp/1.6/Heartbeat';
import { HeartbeatResponse } from 'schemas/ocpp/1.6/HeartbeatResponse';

const handleHeartbeatCallResultReceived: ChargeStationEventHandler<
  HeartbeatRequest,
  HeartbeatResponse
> = async ({ emitter }) => {
  emitter.emitEvent(EventTypes.HeartbeatAccepted);
};

export default handleHeartbeatCallResultReceived;
