import { EventTypes16 as e } from '../eventHandlers/event-types';
import sendBootNotification from '../eventHandlers/ocpp-16/send-boot-notification';
import sendStatusNotificationActive from '../eventHandlers/ocpp-16/send-status-notification-active';
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

export default {
  [e.StationConnected]: [sendBootNotification],
  [e.BootNotificationAccepted]: [sendStatusNotificationActive, sendHeartbeat],
  [e.HeartbeatAccepted]: [sendHeartbeatDelayed],
  [e.SessionStartInitiated]: [sendAuthorize],
  [e.SessionStopInitiated]: [sendStopTransaction],
  [e.AuthorizationFailed]: [handleTokenRejection],
  [e.AuthorizationAccepted]: [sendStartTransaction],
  [e.AuthorizationFailedDuringStartTransaction]: [handleTokenRejection],
  [e.StartTransactionAccepted]: [
    sendStatusNotificationPreparing,
    handleStartCharging,
    handleTransactionStartedUI,
  ],
  [e.StopTransactionAccepted]: [
    sendStatusNotificationAvailable,
    handleTransactionStoppedUI,
  ],
  [e.Charging]: [sendStatusNotificationCharging],
  [e.SessionCancelled]: [sendStatusNotificationAvailable],
};
