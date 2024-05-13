import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { ChangeConfigurationRequest } from 'schemas/ocpp/1.6/ChangeConfiguration';

const handleChangeConfigurationHandler: ChargeStationEventHandler<ChangeConfigurationRequest> =
  ({ chargepoint, callMessageId, callMessageBody }) => {
    const { key } = callMessageBody;

    chargepoint.configuration.setVariable(key, callMessageBody);

    const response = {
      status: 'Accepted',
    };

    chargepoint.writeCallResult(callMessageId, response);
    chargepoint.save();
  };

export default handleChangeConfigurationHandler;
