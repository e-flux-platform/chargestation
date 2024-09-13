import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { ResetRequest } from 'schemas/ocpp/1.6/Reset';
import { ResetResponse } from 'schemas/ocpp/1.6/ResetResponse';

const handleReset: ChargeStationEventHandler<ResetRequest> = ({
  chargepoint,
  callMessageId,
}) => {
  const response: ResetResponse = { status: 'Accepted' };

  chargepoint.writeCallResult(callMessageId, response);
  chargepoint.reboot();
};

export default handleReset;
