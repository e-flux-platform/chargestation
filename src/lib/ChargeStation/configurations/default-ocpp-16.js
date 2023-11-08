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
import handleRemoteStartTransaction from '../eventHandlers/ocpp-16/handle-remote-start-transaction';
import handleRemoteStopTransaction from '../eventHandlers/ocpp-16/handle-remote-stop-transaction';
import handleGetConfiguration from '../eventHandlers/ocpp-16/handle-get-configuration';
import handleChangeConfiguration from '../eventHandlers/ocpp-16/handle-change-configuration';
import handleAuthorizeCallResultReceived from '../eventHandlers/ocpp-16/handle-authorize-call-result-received';
import handleBootNotificationCallResultReceived from '../eventHandlers/ocpp-16/handle-boot-notification-call-result-received';
import handleHeartbeatCallResultReceived from '../eventHandlers/ocpp-16/handle-heartbeat-call-result-received';
import handleStartTransactionCallResultReceived from '../eventHandlers/ocpp-16/handle-start-transaction-call-result-received';
import handleStopTransactionCallResultReceived from '../eventHandlers/ocpp-16/handle-stop-transaction-call-result-received';
import sendChargingLimitReached from '../eventHandlers/ocpp-16/send-charging-limit-reached';
import sendMeterValues from '../eventHandlers/ocpp-16/send-meter-values';
import handleReset from '../eventHandlers/ocpp-16/handle-reset';
import handleSetChargingProfile from '../eventHandlers/ocpp-16/handle-set-charging-profile';

// This is the default configuration for OCPP 1.6
// Each key represents an event, and the value represents an array of handlers that will be called when the event is emitted
export default {
  [e.StationConnected]: [sendBootNotification],
  [e.BootNotificationCallResultReceived]: [
    handleBootNotificationCallResultReceived,
  ],
  [e.BootNotificationAccepted]: [
    sendStatusNotificationAvailable,
    sendHeartbeat,
  ],
  [e.HeartbeatCallResultReceived]: [handleHeartbeatCallResultReceived],
  [e.HeartbeatAccepted]: [sendHeartbeatDelayed],
  [e.SessionStartInitiated]: [sendAuthorize],
  [e.SessionStopInitiated]: [sendStopTransaction],
  [e.AuthorizeCallResultReceived]: [handleAuthorizeCallResultReceived],
  [e.AuthorizationFailed]: [handleTokenRejection],
  [e.AuthorizationAccepted]: [sendStartTransaction],
  [e16.AuthorizationFailedDuringStartTransaction]: [handleTokenRejection],
  [e16.StartTransactionCallResultReceived]: [
    handleStartTransactionCallResultReceived,
  ],
  [e16.StartTransactionAccepted]: [
    sendStatusNotificationPreparing,
    handleStartCharging,
    handleTransactionStartedUI,
  ],
  [e16.StopTransactionCallResultReceived]: [
    handleStopTransactionCallResultReceived,
  ],
  [e16.StopTransactionAccepted]: [
    sendStatusNotificationAvailable,
    handleTransactionStoppedUI,
  ],
  [e.Charging]: [sendStatusNotificationCharging],
  [e.SessionCancelled]: [sendStatusNotificationAvailable],
  [e16.RemoteStartTransactionReceived]: [handleRemoteStartTransaction],
  [e16.RemoteStopTransactionReceived]: [handleRemoteStopTransaction],
  [e16.GetConfigurationReceived]: [handleGetConfiguration],
  [e16.ChangeConfigurationReceived]: [handleChangeConfiguration],
  [e.ChargingTick]: [sendMeterValues],
  [e.ChargingLimitReached]: [sendChargingLimitReached],
  [e.ResetReceived]: [handleReset],
  [e.SetChargingProfileReceived]: [handleSetChargingProfile],
};
