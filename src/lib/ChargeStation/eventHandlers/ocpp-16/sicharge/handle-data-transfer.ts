import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { DataTransferRequest } from 'schemas/ocpp/1.6/DataTransfer';

const handleDataTransfer: ChargeStationEventHandler<DataTransferRequest> = ({
  chargepoint,
  callMessageId,
  callMessageBody,
}) => {
  const { vendorId } = callMessageBody;
  if (vendorId !== 'AdhocPayment') {
    chargepoint.writeCallResult(callMessageId, {
      status: 'UnknownVendorId',
    });
  }
};

export default handleDataTransfer;
