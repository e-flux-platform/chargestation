import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { RequestStopTransactionRequest } from 'schemas/ocpp/2.0/RequestStopTransactionRequest';
import { RequestStopTransactionResponse } from 'schemas/ocpp/2.0/RequestStopTransactionResponse';

const handleRequestStopTransaction: ChargeStationEventHandler<
  RequestStopTransactionRequest
> = ({ chargepoint, callMessageId, callMessageBody }) => {
  const { transactionId } = callMessageBody;

  let response: RequestStopTransactionResponse;

  const connectorId = ['1', '2'].find(
    (cId) =>
      chargepoint.sessions[cId] &&
      chargepoint.sessions[cId].transactionId === transactionId
  );
  if (!connectorId || !chargepoint.hasRunningSession(Number(connectorId))) {
    response = {
      status: 'Rejected',
    };
  } else {
    setTimeout(() => {
      chargepoint.stopSession(Number(connectorId));
    }, 100);
    response = {
      status: 'Accepted',
    };
  }

  chargepoint.writeCallResult(callMessageId, response);
};

export default handleRequestStopTransaction;
