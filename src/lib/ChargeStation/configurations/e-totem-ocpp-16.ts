import DefaultOCPP16 from 'lib/ChargeStation/configurations/default-ocpp-16';
import sendAuthorize from 'lib/ChargeStation/eventHandlers/ocpp-16/send-authorize';
import {
  EventTypes as e,
  EventTypes16 as e16,
} from 'lib/ChargeStation/eventHandlers/event-types';
import overrideSessionUid from 'lib/ChargeStation/eventHandlers/ocpp-16/e-totem/override-session-uid';
import {
  calculateCostsAndSendReceipt,
  processDataTransferResult,
} from 'lib/ChargeStation/eventHandlers/ocpp-16/e-totem/handle-session-stopped';
import sendStatusNotificationFinishing from 'lib/ChargeStation/eventHandlers/ocpp-16/send-status-notification-finishing';
import sendStatusNotificationAvailable from 'lib/ChargeStation/eventHandlers/ocpp-16/send-status-notification-available';
import handleTransactionStoppedUI from 'lib/ChargeStation/eventHandlers/ocpp-16/handle-transaction-stopped-ui';

export default {
  ...DefaultOCPP16,
  [e.SessionStartInitiated]: [overrideSessionUid, sendAuthorize],
  [e.DataTransferCallResultReceived]: [processDataTransferResult],
  [e16.StopTransactionAccepted]: [
    sendStatusNotificationFinishing,
    sendStatusNotificationAvailable,
    calculateCostsAndSendReceipt,
    handleTransactionStoppedUI,
  ],
};