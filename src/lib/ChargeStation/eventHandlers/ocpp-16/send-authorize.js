// Define custom handlers for each event and put them in the handlerConfig
import { sleep } from '../../../../utils/csv';

export default async function sendAuthorize({ emitter, chargepoint, session }) {
  await sleep(1000);
  chargepoint.writeCall('Authorize', {
    idTag: session.options.uid,
  });
}
