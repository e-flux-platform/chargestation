export default async function handleRemoteStopTransaction({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
  const { transactionId } = callMessageBody;

  let connectorId;
  let response;

  ['1', '2'].forEach((cId) => {
    if (
      chargepoint.sessions[cId] &&
      chargepoint.sessions[cId].transactionId === transactionId
    ) {
      connectorId = cId.toString();
    }
  });
  if (!connectorId || !chargepoint.hasRunningSession(Number(connectorId))) {
    response = {
      status: 'Rejected',
    };
  }
  setTimeout(() => {
    chargepoint.stopSession(Number(connectorId));
  }, 100);
  response = {
    status: 'Accepted',
  };

  chargepoint.writeCallResult(callMessageId, response);
}
