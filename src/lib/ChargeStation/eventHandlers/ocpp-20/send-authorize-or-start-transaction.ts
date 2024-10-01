import {
  ChargeStationEventHandler,
  ChargeStationEventHandlerParams,
} from 'lib/ChargeStation/eventHandlers';
import sendStartTransaction from 'lib/ChargeStation/eventHandlers/ocpp-20/send-start-transaction';
import sendAuthorize from 'lib/ChargeStation/eventHandlers/ocpp-20/send-authorize';
import { AuthorizeRequest } from 'schemas/ocpp/2.0/AuthorizeRequest';
import { AuthorizeResponse } from 'schemas/ocpp/2.0/AuthorizeResponse';

const sendAuthorizeOrStartTransaction: ChargeStationEventHandler = async (
  params
) => {
  if (params.session.options?.skipAuthorize !== true) {
    return sendAuthorize(
      params as ChargeStationEventHandlerParams<
        AuthorizeRequest,
        AuthorizeResponse
      >
    );
  }

  return sendStartTransaction(params);
};

export default sendAuthorizeOrStartTransaction;
