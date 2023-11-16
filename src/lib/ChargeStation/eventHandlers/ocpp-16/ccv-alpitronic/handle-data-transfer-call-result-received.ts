import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { EventTypes } from '../../event-types';

const handleDataTransferCallResultReceived: ChargeStationEventHandler = async ({
  emitter,
  session,
  callResultMessageBody,
}) => {
  const data = JSON.parse(callResultMessageBody.data);

  // In case of an authorization. Can be improved a bit if we actually pass the actual messageId (Authorize/Receipt)
  if (data.tagId) {
    // Update the uid with the one we got from the CSMS.
    session.options.uid = data.tagId;
    emitter.emitEvent(EventTypes.AuthorizationAccepted, { session });
  }
};

export default handleDataTransferCallResultReceived;
