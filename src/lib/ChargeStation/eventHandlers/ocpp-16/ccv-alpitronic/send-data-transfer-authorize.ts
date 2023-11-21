import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { v4 as uuid } from 'uuid';

const sendDataTransferAuthorize: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  const data = {
    terminalId: '1234',
    paymentId: uuid(),
  };

  chargepoint.writeCall(
    'DataTransfer',
    {
      vendorId: 'OnSitePay',
      data: JSON.stringify(data),
      messageId: 'Authorize',
    },
    session
  );
};

export default sendDataTransferAuthorize;
