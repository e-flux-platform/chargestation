export default async function handleChangeConfiguration({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
  const { key, value } = callMessageBody;
  chargepoint.configuration[key] = value;

  const response = {
    status: 'Accepted',
  };

  chargepoint.connection.writeCallResult(callMessageId, response);
}
