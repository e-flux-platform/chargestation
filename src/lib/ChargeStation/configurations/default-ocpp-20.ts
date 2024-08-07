import {
  EventTypes201 as e201,
  EventTypes as e,
} from '../eventHandlers/event-types';
import sendBootNotification from '../eventHandlers/ocpp-20/send-boot-notification';
import sendHeartbeat from '../eventHandlers/ocpp-20/send-heartbeat';
import sendHeartbeatDelayed from '../eventHandlers/ocpp-20/send-heartbeat-delayed';
import sendStatusNotification from '../eventHandlers/ocpp-20/send-status-notification';
import handleBootNotificationCallResultReceived from '../eventHandlers/ocpp-20/handle-boot-notification-call-result-received';
import handleHeartbeatCallResultReceived from '../eventHandlers/ocpp-20/handle-heartbeat-call-result-received';
import handleGetBaseReportReceived from '../eventHandlers/ocpp-20/handle-get-base-report-received';
import handleSetVariables from '../eventHandlers/ocpp-20/handle-set-variables';
import sendAuthorize from '../eventHandlers/ocpp-20/send-authorize';
import sendStopTransaction from '../eventHandlers/ocpp-20/send-stop-transaction';
import handleAuthorizeCallResultReceived from '../eventHandlers/ocpp-20/handle-authorize-call-result-received';
import handleTokenRejection from '../eventHandlers/ocpp-20/handle-token-rejection';
import sendStartTransaction from '../eventHandlers/ocpp-20/send-start-transaction';
import handleTransactionEventCallResultReceived from '../eventHandlers/ocpp-20/handle-transaction-event-call-result-received';
import sendTransationEventUpdated from '../eventHandlers/ocpp-20/send-transaction-event-updated';
import sendChargingLimitReached from '../eventHandlers/ocpp-20/send-charging-limit-reached';
import handleTransactionStartedUI from 'lib/ChargeStation/eventHandlers/ocpp-16/handle-transaction-started-ui';
import handleTransactionStoppedUI from 'lib/ChargeStation/eventHandlers/ocpp-16/handle-transaction-stopped-ui';
import handleReset from 'lib/ChargeStation/eventHandlers/ocpp-20/handle-reset';
import handleSetChargingProfile from 'lib/ChargeStation/eventHandlers/ocpp-20/handle-set-charging-profile';
import handleGetVariables from 'lib/ChargeStation/eventHandlers/ocpp-20/handle-get-variables';
import handleDataTransfer from 'lib/ChargeStation/eventHandlers/ocpp-20/handle-data-transfer';
import handleRequestStartTransaction from 'lib/ChargeStation/eventHandlers/ocpp-20/handle-request-start-transaction';
import handleRequestStopTransaction from 'lib/ChargeStation/eventHandlers/ocpp-20/handle-request-stop-transaction';
import handleGetInstalledCertificateIds from 'lib/ChargeStation/eventHandlers/ocpp-20/handle-get-installed-certificate-ids';

// This is the default configuration for OCPP 2.0.*
// Each key represents an event, and the value represents an array of handlers that will be called when the event is emitted
export default {
  [e.StationConnected]: [sendBootNotification],
  [e.BootNotificationCallResultReceived]: [
    handleBootNotificationCallResultReceived,
  ],
  [e.BootNotificationAccepted]: [sendHeartbeat, sendStatusNotification],
  [e.HeartbeatCallResultReceived]: [handleHeartbeatCallResultReceived],
  [e.HeartbeatAccepted]: [sendHeartbeatDelayed],
  [e201.GetBaseReportReceived]: [handleGetBaseReportReceived],
  [e201.SetVariablesReceived]: [handleSetVariables],
  [e201.GetVariablesReceived]: [handleGetVariables],
  [e.SessionStartInitiated]: [sendAuthorize],
  [e.SessionStopInitiated]: [sendStopTransaction],
  [e.AuthorizeCallResultReceived]: [handleAuthorizeCallResultReceived],
  [e.AuthorizationFailed]: [handleTokenRejection],
  [e.SessionCancelled]: [sendStatusNotification],
  [e.AuthorizationAccepted]: [sendStartTransaction],
  [e201.TransactionEventCallResultReceived]: [
    handleTransactionEventCallResultReceived,
  ],
  [e201.RequestStartTransactionReceived]: [handleRequestStartTransaction],
  [e201.RequestStopTransactionReceived]: [handleRequestStopTransaction],
  [e.Charging]: [handleTransactionStartedUI],
  [e.Stopped]: [handleTransactionStoppedUI],
  [e.ChargingTick]: [sendTransationEventUpdated],
  [e.ChargingLimitReached]: [sendChargingLimitReached],
  [e.ResetReceived]: [handleReset],
  [e.SetChargingProfileReceived]: [handleSetChargingProfile],
  [e.DataTransferReceived]: [handleDataTransfer],
  [e.GetInstalledCertificateIdsReceived]: [handleGetInstalledCertificateIds],
};
