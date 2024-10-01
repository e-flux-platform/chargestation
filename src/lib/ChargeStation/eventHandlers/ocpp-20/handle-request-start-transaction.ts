import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { RequestStartTransactionRequest } from 'schemas/ocpp/2.0/RequestStartTransactionRequest';
import { RequestStartTransactionResponse } from 'schemas/ocpp/2.0/RequestStartTransactionResponse';

const handleRequestStartTransaction: ChargeStationEventHandler<
  RequestStartTransactionRequest
> = ({ chargepoint, callMessageId, callMessageBody }) => {
  const { remoteStartId, evseId, idToken } = callMessageBody;

  let response: RequestStartTransactionResponse;

  if (chargepoint.hasRunningSession(Number(evseId))) {
    response = {
      status: 'Rejected',
    };
  } else {
    setTimeout(() => {
      chargepoint.startSession(
        Number(evseId),
        {
          authorizationType: 'rfid',
          carBatteryKwh: 0,
          carBatteryStateOfCharge: 0,
          maxPowerKw: 0,
          uid: idToken.idToken,
          remoteStartId,
          skipAuthorize:
            chargepoint.configuration
              .getVariableValue('AuthCtrlr.AuthorizeRemoteStart')
              ?.toString() === 'false',
        },
        'rfid'
      );
    }, 100);
    response = {
      status: 'Accepted',
    };
  }

  chargepoint.writeCallResult(callMessageId, response);
};

export default handleRequestStartTransaction;
