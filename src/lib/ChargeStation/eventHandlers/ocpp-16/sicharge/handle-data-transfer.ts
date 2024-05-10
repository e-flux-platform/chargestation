import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { DataTransferRequest } from 'schemas/ocpp/1.6/DataTransfer';

const handleDataTransfer: ChargeStationEventHandler<DataTransferRequest> = ({
  chargepoint,
  callMessageId,
  callMessageBody,
}) => {
  const { vendorId } = callMessageBody;
  const status = vendorId === 'AdhocPayment' ? 'Accepted' : 'UnknownVendorId';
  chargepoint.writeCallResult(callMessageId, {
    status,
  });
};

export default handleDataTransfer;
