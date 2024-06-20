import { sleep } from 'utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizeRequest } from 'schemas/ocpp/2.0/AuthorizeRequest';
import { AuthorizeResponse } from 'schemas/ocpp/2.0/AuthorizeResponse';

const sendAuthorize: ChargeStationEventHandler<
  AuthorizeRequest,
  AuthorizeResponse
> = async ({ chargepoint, session }) => {
  await sleep(1000);

  chargepoint.writeCall(
      'Authorize',
      {idToken: {idToken: session.options.uid, type: 'ISO14443'}},
      session
  );
};

export default sendAuthorize;
