import DefaultOCPP16 from 'lib/ChargeStation/configurations/default-ocpp-16';
import { EventTypes as e } from 'lib/ChargeStation/eventHandlers/event-types';
import sendAuthorizeOrStartTransaction from 'lib/ChargeStation/eventHandlers/ocpp-16/send-authorize-or-start-transaction';
import overrideSessionUid from 'lib/ChargeStation/eventHandlers/ocpp-16/madic-lafon/override-session-uid';
import sendStopTransactionWithCost from 'lib/ChargeStation/eventHandlers/ocpp-16/madic-lafon/session-stop-initiated';

export default {
  ...DefaultOCPP16,
  [e.SessionStartInitiated]: [
    overrideSessionUid,
    sendAuthorizeOrStartTransaction,
  ],
  [e.SessionStopInitiated]: [sendStopTransactionWithCost],
};
