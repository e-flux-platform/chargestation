export default async function handleDataTransfer({
  chargepoint,
  callMessageId,
}) {
  chargepoint.writeCallResult(callMessageId, {
    status: 'UnknownVendorId',
  });
}
