import { getConfigurationKey201 } from '../../../settings';

export default async function handleSetVariables({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
  const { setVariableData } = callMessageBody;

  for (const variable of setVariableData) {
    const key = getConfigurationKey201(variable);
    chargepoint.configuration.setVariable(key, variable);
  }

  const response = {
    status: 'Accepted',
  };

  chargepoint.writeCallResult(callMessageId, response);
}
