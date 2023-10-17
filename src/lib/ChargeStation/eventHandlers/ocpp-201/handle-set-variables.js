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

  chargepoint.writeCallResult(callMessageId, {
    setVariableResult: setVariableData.map((variable) => ({
      attributeType: variable.attributeType,
      attributeStatus: 'Accepted',
      component: variable.component,
      variable: variable.variable,
    })),
  });
}
