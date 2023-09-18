export default async function handleRemoteStartTransaction({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
  const { idTag, connectorId } = callMessageBody;

  let response;

  if (chargepoint.hasRunningSession(connectorId.toString())) {
    response = {
      status: 'Rejected',
    };
  }
  setTimeout(() => {
    chargepoint.startSession(connectorId.toString(), {
      uid: idTag,
    });
  }, 100);
  response = {
    status: 'Accepted',
  };

  chargepoint.writeCallResult(callMessageId, response);
}
