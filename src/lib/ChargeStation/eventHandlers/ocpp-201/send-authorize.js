import { getConfigurationKey201 } from '../../../settings';

export default async function sendAuthorize({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
  const { idTag } = callMessageBody;

  // chargepoint.writeCallResult(callMessageId, response);
}
