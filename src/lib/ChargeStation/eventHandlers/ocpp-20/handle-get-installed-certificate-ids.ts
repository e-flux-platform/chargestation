import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { GetInstalledCertificateIdsRequest } from 'schemas/ocpp/2.0/GetInstalledCertificateIdsRequest';
import { GetInstalledCertificateIdsResponse } from 'schemas/ocpp/2.0/GetInstalledCertificateIdsResponse';

const handleGetInstalledCertificateIds: ChargeStationEventHandler<
  GetInstalledCertificateIdsRequest,
  GetInstalledCertificateIdsResponse
> = async ({ chargepoint, callMessageId }) => {
  chargepoint.writeCallResult(callMessageId, {
    status: 'Accepted',
  });
};

export default handleGetInstalledCertificateIds;
