import { EventTypes as e } from '../eventHandlers/event-types';
import DefaultOCPP16 from 'lib/ChargeStation/configurations/default-ocpp-16';
import handleDataTransfer from 'lib/ChargeStation/eventHandlers/ocpp-16/sicharge/handle-data-transfer';
import generateSessionUid from 'lib/ChargeStation/eventHandlers/ocpp-16/sicharge/generate-session-uid';
import sendAuthorizeOrStartTransaction from 'lib/ChargeStation/eventHandlers/ocpp-16/send-authorize-or-start-transaction';

export default {
  ...DefaultOCPP16,
  [e.SessionStartInitiated]: [
    generateSessionUid,
    sendAuthorizeOrStartTransaction,
  ],
  [e.DataTransferReceived]: [handleDataTransfer],
};
