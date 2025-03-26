import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizeResponse } from 'schemas/ocpp/1.6/AuthorizeResponse';
import { AuthorizeRequest } from 'schemas/ocpp/1.6/Authorize';

const handleAuthorizeCallResultReceived: ChargeStationEventHandler<
  AuthorizeRequest,
  AuthorizeResponse
> = ({ emitter, session, callResultMessageBody }) => {
  if (
    callResultMessageBody.idTagInfo.status !== 'Accepted' &&
    !session.ignoreCSMSAuthResponse
  ) {
    emitter.emitEvent(EventTypes.AuthorizationFailed, { session });
    alert('Token UID was not accepted');
    return;
  }

  emitter.emitEvent(EventTypes.AuthorizationAccepted, { session });
};

export default handleAuthorizeCallResultReceived;
