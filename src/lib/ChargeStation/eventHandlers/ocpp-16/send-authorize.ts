// Define custom handlers for each event and put them in the handlerConfig
import { sleep } from '../../../../utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizeRequest } from 'schemas/ocpp/1.6/Authorize';

const sendAuthorize: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  if (!session) return;

  await sleep(1000);

  const authorizeRequest: AuthorizeRequest = {
    idTag: session.options.uid,
  };

  chargepoint.writeCall('Authorize', authorizeRequest, session);
};

export default sendAuthorize;
