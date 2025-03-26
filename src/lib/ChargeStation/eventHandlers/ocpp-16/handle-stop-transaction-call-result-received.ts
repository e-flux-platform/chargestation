import { EventTypes, EventTypes16 } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StopTransactionRequest } from 'schemas/ocpp/1.6/StopTransaction';
import { StopTransactionResponse } from 'schemas/ocpp/1.6/StopTransactionResponse';

const handleStopTransactionCallResultReceived: ChargeStationEventHandler<
  StopTransactionRequest,
  StopTransactionResponse
> = ({ emitter, callResultMessageBody, session, chargepoint }) => {
  if (
    callResultMessageBody.idTagInfo?.status !== 'Accepted' &&
    !session.ignoreCSMSAuthResponse
  ) {
    emitter.emitEvent(EventTypes.AuthorizationFailedDuringTransactionStop, {
      session,
    });
    return;
  }

  delete chargepoint.sessions[session.connectorId];

  emitter.emitEvent(EventTypes16.StopTransactionAccepted, { session });
};

export default handleStopTransactionCallResultReceived;
