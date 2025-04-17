import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { DataTransferRequest } from 'schemas/ocpp/2.0/DataTransferRequest';
import { DataTransferResponse } from 'schemas/ocpp/2.0/DataTransferResponse';

const handleDataTransfer: ChargeStationEventHandler<
  DataTransferRequest,
  DataTransferResponse
> = async ({ chargepoint, callMessageId }) => {
  chargepoint.writeCallResult(callMessageId, {
    status: 'UnknownVendorId',
  });
};

export default handleDataTransfer;
