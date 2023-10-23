// Define custom handlers for each event and put them in the handlerConfig
import { sleep } from '../../../../utils/csv';

export default async function sendAuthorize({ chargepoint, session }) {
  await sleep(1000);

  console.log('HERE2');

  await chargepoint.writeCall(
    'Authorize',
    { idToken: { idToken: session.options.uid, type: 'ISO14443' } },
    session
  );
}
