import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import sendAuthorize from 'lib/ChargeStation/eventHandlers/ocpp-16/send-authorize';
import sendStartTransaction from 'lib/ChargeStation/eventHandlers/ocpp-16/send-start-transaction';

const sendAuthorizeOrStartTransaction: ChargeStationEventHandler = async (
  params
) => {
  if (params.session.options?.skipAuthorize !== true) {
    return sendAuthorize(params);
  }
  return sendStartTransaction(params);
};

export default sendAuthorizeOrStartTransaction;
