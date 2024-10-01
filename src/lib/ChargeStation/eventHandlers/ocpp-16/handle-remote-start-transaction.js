export default async function handleRemoteStartTransaction({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
  const { idTag, connectorId } = callMessageBody;

  let response;

  if (chargepoint.hasRunningSession(Number(connectorId))) {
    response = {
      status: 'Rejected',
    };
  }
  setTimeout(() => {
    chargepoint.startSession(Number(connectorId), {
      uid: idTag,
      skipAuthorize:
        chargepoint.configuration
          .getVariableValue('AuthorizeRemoteTxRequests')
          ?.toString() === 'false',
    });
  }, 100);
  response = {
    status: 'Accepted',
  };

  chargepoint.writeCallResult(callMessageId, response);
}
