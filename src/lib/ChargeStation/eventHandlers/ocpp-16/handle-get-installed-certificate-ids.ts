import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { GetInstalledCertificateIdsRequest } from 'schemas/ocpp/1.6/GetInstalledCertificateIds';
import { GetInstalledCertificateIdsResponse } from 'schemas/ocpp/1.6/GetInstalledCertificateIdsResponse';

const handleGetInstalledCertificateIds: ChargeStationEventHandler<
  GetInstalledCertificateIdsRequest
> = ({ chargepoint, callMessageId }) => {
  const response: GetInstalledCertificateIdsResponse = {
    status: 'Accepted',
    certificateHashData: [
      // GTS Root R1
      {
        hashAlgorithm: 'SHA256',
        issuerNameHash:
          'b4229779897b2bc6e37a5f67b61dbf32c537845a621b9af7b61fdf89ca39d3f6',
        issuerKeyHash:
          '94af08ac6bbe62bddb9ee8839f18b991290691c0b35db2651b58d98b6a4bea38',
        serialNumber: '203e5936f31b01349886ba217',
      },
      // GTS Root R2
      {
        hashAlgorithm: 'SHA256',
        issuerNameHash:
          '974ad0f30a2e52864e241617e31d84ab0e0c3d3fa50726e2eef105216d26684a',
        issuerKeyHash:
          'b56a86de52450c917019d6ebe6fab351534751facb7d755069bcc97003292804',
        serialNumber: '203e5aec58d04251aab1125aa',
      },
    ],
  };

  chargepoint.writeCallResult(callMessageId, response);
};

export default handleGetInstalledCertificateIds;
