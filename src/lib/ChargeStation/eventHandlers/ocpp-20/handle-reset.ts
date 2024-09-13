import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { ResetRequest } from 'schemas/ocpp/2.0/ResetRequest';
import { ResetResponse } from 'schemas/ocpp/2.0/ResetResponse';

const handleReset: ChargeStationEventHandler<ResetRequest> = ({
  chargepoint,
  callMessageId,
}) => {
  const response: ResetResponse = { status: 'Accepted' };

  chargepoint.writeCallResult(callMessageId, response);
  chargepoint.reboot();
};

export default handleReset;
