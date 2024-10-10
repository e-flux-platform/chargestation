import { AuthorizeRequest } from 'schemas/ocpp/2.0/AuthorizeRequest';
import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizeResponse } from 'schemas/ocpp/2.0/AuthorizeResponse';

const handleAuthorizeCallResultReceived: ChargeStationEventHandler<
  AuthorizeRequest,
  AuthorizeResponse
> = ({ emitter, session, callResultMessageBody }) => {
  if (callResultMessageBody.idTokenInfo.status !== 'Accepted') {
    emitter.emitEvent(EventTypes.AuthorizationFailed, { session });
    alert('Token UID was not accepted');
    return;
  }

  emitter.emitEvent(EventTypes.AuthorizationAccepted, { session });
};

export default handleAuthorizeCallResultReceived;
