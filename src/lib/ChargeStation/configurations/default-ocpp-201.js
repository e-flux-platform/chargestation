import { EventTypes as e } from '../eventHandlers/event-types';
import sendBootNotification from '../eventHandlers/ocpp-201/send-boot-notification';
import sendHeartbeat from '../eventHandlers/ocpp-201/send-heartbeat';
import sendHeartbeatDelayed from '../eventHandlers/ocpp-201/send-heartbeat-delayed';
import handleBootNotificationCallResultReceived from '../eventHandlers/ocpp-201/handle-boot-notification-call-result-received';
import handleHeartbeatCallResultReceived from '../eventHandlers/ocpp-201/handle-heartbeat-call-result-received';

// This is the default configuration for OCPP 2.0.1
// Each key represents an event, and the value represents an array of handlers that will be called when the event is emitted
export default {
  [e.StationConnected]: [sendBootNotification],
  [e.BootNotificationCallResultReceived]: [
    handleBootNotificationCallResultReceived,
  ],
  [e.BootNotificationAccepted]: [sendHeartbeat],
  [e.HeartbeatCallResultReceived]: [handleHeartbeatCallResultReceived],
  [e.HeartbeatAccepted]: [sendHeartbeatDelayed],
};
