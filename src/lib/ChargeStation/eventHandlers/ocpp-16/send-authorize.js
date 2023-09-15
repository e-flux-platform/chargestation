// Define custom handlers for each event and put them in the handlerConfig
import { EventTypes16 } from '../event-types';

export default async function sendAuthorize(chargepoint, emitter, session) {
  await sleep(1000);
  const authorizeResponse = await session.options.sendCommand('Authorize', {
    idTag: session.options.uid,
  });
  if (authorizeResponse.idTagInfo.status === 'Invalid') {
    emitter.emitEvent(EventTypes16.AuthorizationFailed, session);
    return;
  }

  emitter.emitEvent(EventTypes16.AuthorizationAccepted, session);
}
