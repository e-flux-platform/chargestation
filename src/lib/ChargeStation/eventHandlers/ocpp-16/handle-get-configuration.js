export default async function handleGetConfiguration({
  chargepoint,
  callMessageId,
}) {
  const response = {
    configurationKey: Object.keys(chargepoint.configuration).map((key) => {
      return {
        key,
        value: chargepoint.configuration[key],
        readOnly: false,
      };
    }),
    unknownKey: [],
  };
  chargepoint.writeCallResult(callMessageId, response);
}
