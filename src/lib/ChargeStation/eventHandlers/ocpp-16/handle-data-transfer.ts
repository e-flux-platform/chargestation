import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { DataTransferRequest } from 'schemas/ocpp/1.6/DataTransfer';
import { DataTransferResponse } from 'schemas/ocpp/1.6/DataTransferResponse';

const handleDataTransfer: ChargeStationEventHandler<
  DataTransferRequest,
  DataTransferResponse
> = async ({ chargepoint, callMessageId }) => {
  chargepoint.writeCallResult(callMessageId, {
    status: 'UnknownVendorId',
  });
};

export default handleDataTransfer;
