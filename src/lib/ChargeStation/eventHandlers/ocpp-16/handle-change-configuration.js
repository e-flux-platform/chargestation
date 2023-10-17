export default async function handleChangeConfiguration({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
  const { key } = callMessageBody;

  chargepoint.configuration.setVariable(key, callMessageBody);

  const response = {
    status: 'Accepted',
  };

  chargepoint.writeCallResult(callMessageId, response);
}
