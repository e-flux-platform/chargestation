import {
  EventTypes16 as e16,
  EventTypes as e,
} from '../eventHandlers/event-types';
import sendStatusNotificationPreparing from '../eventHandlers/ocpp-16/send-status-notification-preparing';
import sendStatusNotificationAvailable from '../eventHandlers/ocpp-16/send-status-notification-available';
import sendStatusNotificationFinishing from '../eventHandlers/ocpp-16/send-status-notification-finishing';
import handleTransactionStoppedUI from '../eventHandlers/ocpp-16/handle-transaction-stopped-ui';
import sendDataTransferAuthorize from 'lib/ChargeStation/eventHandlers/ocpp-16/ccv-alpitronic/send-data-transfer-authorize';
import sendDataTransferReceipt from 'lib/ChargeStation/eventHandlers/ocpp-16/ccv-alpitronic/send-data-transfer-receipt';
import handleDataTransferCallResultReceived from 'lib/ChargeStation/eventHandlers/ocpp-16/ccv-alpitronic/handle-data-transfer-call-result-received';
import DefaultOCPP16 from 'lib/ChargeStation/configurations/default-ocpp-16';

export default {
  ...DefaultOCPP16,
  [e.SessionStartInitiated]: [
    sendStatusNotificationPreparing,
    sendDataTransferAuthorize,
  ],
  [e.DataTransferCallResultReceived]: [handleDataTransferCallResultReceived],
  [e.AuthorizeCallResultReceived]: [],
  [e16.StopTransactionAccepted]: [
    sendStatusNotificationFinishing,
    sendStatusNotificationAvailable,
    handleTransactionStoppedUI,
    sendDataTransferReceipt,
  ],
};
