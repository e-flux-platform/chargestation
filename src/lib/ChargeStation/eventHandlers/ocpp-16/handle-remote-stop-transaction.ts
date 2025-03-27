import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { RemoteStopTransactionRequest } from 'schemas/ocpp/1.6/RemoteStopTransaction';
import { RemoteStopTransactionResponse } from 'schemas/ocpp/1.6/RemoteStopTransactionResponse';

const handleRemoteStopTransaction: ChargeStationEventHandler<
  RemoteStopTransactionRequest,
  RemoteStopTransactionResponse
> = async ({ chargepoint, callMessageId, callMessageBody }) => {
  const { transactionId } = callMessageBody;

  let connectorId: string | undefined;
  let response: RemoteStopTransactionResponse;

  ['1', '2'].forEach((cId) => {
    if (
      chargepoint.sessions[cId] &&
      chargepoint.sessions[cId].transactionId === transactionId.toString()
    ) {
      connectorId = cId.toString();
    }
  });

  if (!connectorId || !chargepoint.hasRunningSession(Number(connectorId))) {
    response = {
      status: 'Rejected',
    };
  } else {
    setTimeout(() => {
      chargepoint.stopSession(Number(connectorId as string));
    }, 100);
    response = {
      status: 'Accepted',
    };
  }

  chargepoint.writeCallResult(callMessageId, response);
};

export default handleRemoteStopTransaction;
