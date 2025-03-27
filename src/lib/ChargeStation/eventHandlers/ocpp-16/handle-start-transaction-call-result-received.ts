import { EventTypes, EventTypes16 } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StartTransactionRequest } from 'schemas/ocpp/1.6/StartTransaction';
import { StartTransactionResponse } from 'schemas/ocpp/1.6/StartTransactionResponse';

const handleStartTransactionCallResultReceived: ChargeStationEventHandler<
  StartTransactionRequest,
  StartTransactionResponse
> = ({ emitter, callResultMessageBody, session, chargepoint }) => {
  if (
    callResultMessageBody.idTagInfo.status !== 'Accepted' &&
    !session.ignoreCSMSAuthResponse
  ) {
    emitter.emitEvent(EventTypes.AuthorizationFailedDuringTransactionStart, {
      session,
    });
    return;
  }

  session.transactionId = callResultMessageBody.transactionId?.toString();
  chargepoint.sessions[session.connectorId].isStartingSession = false;

  emitter.emitEvent(EventTypes16.StartTransactionAccepted, { session });
};

export default handleStartTransactionCallResultReceived;
