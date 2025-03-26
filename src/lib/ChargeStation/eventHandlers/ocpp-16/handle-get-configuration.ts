import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { GetConfigurationRequest } from 'schemas/ocpp/1.6/GetConfiguration';
import { GetConfigurationResponse } from 'schemas/ocpp/1.6/GetConfigurationResponse';
import { Variable16 } from 'lib/settings';

const handleGetConfiguration: ChargeStationEventHandler<
  GetConfigurationRequest,
  GetConfigurationResponse
> = async ({ chargepoint, callMessageId }) => {
  const response: GetConfigurationResponse = {
    configurationKey: chargepoint.configuration
      .getVariablesArray()
      .map((variable) => {
        // Handle Variable16 type which has key and value properties
        if ('key' in variable && 'value' in variable) {
          const v16 = variable as Variable16;
          return {
            key: v16.key,
            value: `${v16.value}`,
            readonly: false,
          };
        }
        // For Variable201 type, we'll skip it as it's not applicable for OCPP 1.6
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
    unknownKey: [],
  };
  chargepoint.writeCallResult(callMessageId, response);
};

export default handleGetConfiguration;
