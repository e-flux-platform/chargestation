import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { SetVariablesRequest } from 'schemas/ocpp/2.0/SetVariablesRequest';
import { SetVariablesResponse } from 'schemas/ocpp/2.0/SetVariablesResponse';
import { Variable201, getConfigurationKey201 } from '../../../settings';

const handleSetVariables: ChargeStationEventHandler<
  SetVariablesRequest,
  SetVariablesResponse
> = ({ chargepoint, callMessageId, callMessageBody }) => {
  const { setVariableData } = callMessageBody;

  for (const variable of setVariableData) {
    const v: Variable201 = {
      component: variable.component,
      variable: variable.variable,
      // not required for fetching the configuration key
      // but required for the type
      variableAttribute: [],
    };

    const key = getConfigurationKey201(v);
    chargepoint.configuration.setVariable(key, variable);
  }

  chargepoint.writeCallResult(callMessageId, {
    setVariableResult: setVariableData.map((variable) => ({
      attributeType: variable.attributeType,
      attributeStatus: 'Accepted',
      component: variable.component,
      variable: variable.variable,
    })),
  });
};

export default handleSetVariables;
