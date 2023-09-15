import {
  EventTypes16 as e16,
  EventTypes as e,
} from '../eventHandlers/event-types';
import sendBootNotification from '../eventHandlers/ocpp-16/send-boot-notification';
import sendHeartbeat from '../eventHandlers/ocpp-16/send-heartbeat';
import sendHeartbeatDelayed from '../eventHandlers/ocpp-16/send-heartbeat-delayed';
import sendAuthorize from '../eventHandlers/ocpp-16/send-authorize';
import sendStopTransaction from '../eventHandlers/ocpp-16/send-stop-transaction';
import handleTokenRejection from '../eventHandlers/ocpp-16/handle-token-rejection';
import sendStartTransaction from '../eventHandlers/ocpp-16/send-start-transaction';
import sendStatusNotificationPreparing from '../eventHandlers/ocpp-16/send-status-notification-preparing';
import handleStartCharging from '../eventHandlers/ocpp-16/handle-start-charging';
import handleTransactionStartedUI from '../eventHandlers/ocpp-16/handle-transaction-started-ui';
import sendStatusNotificationAvailable from '../eventHandlers/ocpp-16/send-status-notification-available';
import handleTransactionStoppedUI from '../eventHandlers/ocpp-16/handle-transaction-stopped-ui';
import sendStatusNotificationCharging from '../eventHandlers/ocpp-16/send-status-notification-charging';

// This is the default configuration for OCPP 1.6
// Each key represents an event, and the value represents an array of handlers that will be called when the event is emitted
export default {
  [e16.StationConnected]: [sendBootNotification],
  [e16.BootNotificationAccepted]: [
    sendStatusNotificationAvailable,
    sendHeartbeat,
  ],
  [e16.HeartbeatAccepted]: [sendHeartbeatDelayed],
  [e.SessionStartInitiated]: [sendAuthorize],
  [e.SessionStopInitiated]: [sendStopTransaction],
  [e16.AuthorizationFailed]: [handleTokenRejection],
  [e16.AuthorizationAccepted]: [sendStartTransaction],
  [e16.AuthorizationFailedDuringStartTransaction]: [handleTokenRejection],
  [e16.StartTransactionAccepted]: [
    sendStatusNotificationPreparing,
    handleStartCharging,
    handleTransactionStartedUI,
  ],
  [e16.StopTransactionAccepted]: [
    sendStatusNotificationAvailable,
    handleTransactionStoppedUI,
  ],
  [e16.Charging]: [sendStatusNotificationCharging],
  [e16.SessionCancelled]: [sendStatusNotificationAvailable],
};
