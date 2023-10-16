export default async function handleChangeConfiguration({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
  const { key } = callMessageBody;

  chargepoint.configuration.setVariable(key, callMessageBody);

  if (chargepoint.configuration[key]) {
    chargepoint.configuration[key].value = value;
  } else {
    chargepoint.configuration[key] = callMessageBody;
  }

  const response = {
    status: 'Accepted',
  };

  chargepoint.writeCallResult(callMessageId, response);
}
