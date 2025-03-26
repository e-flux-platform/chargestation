import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { RemoteStartTransactionRequest } from 'schemas/ocpp/1.6/RemoteStartTransaction';
import { RemoteStartTransactionResponse } from 'schemas/ocpp/1.6/RemoteStartTransactionResponse';
import { AuthorizationType } from 'lib/settings';

const handleRemoteStartTransaction: ChargeStationEventHandler<
  RemoteStartTransactionRequest,
  RemoteStartTransactionResponse
> = async ({ chargepoint, callMessageId, callMessageBody }) => {
  const { idTag, connectorId } = callMessageBody;

  let response: RemoteStartTransactionResponse;

  if (chargepoint.hasRunningSession(Number(connectorId))) {
    response = {
      status: 'Rejected',
    };
  } else {
    setTimeout(() => {
      chargepoint.startSession(
        Number(connectorId),
        {
          uid: idTag,
          skipAuthorize:
            chargepoint.configuration
              .getVariableValue('AuthorizeRemoteTxRequests')
              ?.toString() === 'false',
          maxPowerKw: 22,
          carBatteryKwh: 64,
          carBatteryStateOfCharge: 80,
          authorizationType: AuthorizationType.RFID,
        },
        AuthorizationType.RFID
      );
    }, 100);
    response = {
      status: 'Accepted',
    };
  }

  chargepoint.writeCallResult(callMessageId, response);
};

export default handleRemoteStartTransaction;
