import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

// TODO: Import the correct schema from 1.6 when available
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
