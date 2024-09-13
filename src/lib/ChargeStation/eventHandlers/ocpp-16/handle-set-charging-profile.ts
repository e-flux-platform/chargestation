import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { SetChargingProfileRequest } from 'schemas/ocpp/1.6/SetChargingProfile';
import { SetChargingProfileResponse } from 'schemas/ocpp/1.6/SetChargingProfileResponse';

const handleSetChargingProfile: ChargeStationEventHandler<
  SetChargingProfileRequest
> = ({ chargepoint, callMessageId }) => {
  const response: SetChargingProfileResponse = { status: 'Accepted' };

  chargepoint.writeCallResult(callMessageId, response);
};

export default handleSetChargingProfile;
