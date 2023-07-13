export function extractOcppBaseUrlFromConfiguration(configuration) {
  // Alfen
  if (
    configuration['BackOffice-URL-wired'] &&
    configuration['BackOffice-Path-wired']
  ) {
    return `${configuration['BackOffice-URL-wired']}${configuration['BackOffice-Path-wired']}`;
  }
  if (
    configuration['BackOffice-URL-APN'] &&
    configuration['BackOffice-Path-APN']
  ) {
    return `${configuration['BackOffice-URL-APN']}${configuration['BackOffice-Path-APN']}`;
  }

  // Evnex
  if (configuration['OCPPEndPoint']) {
    return configuration['OCPPEndPoint'];
  }

  return null;
}

export function summarizeCommandParams(protocol, { method, params }) {
  if (protocol === 'ocpp1.6') {
    switch (method) {
      case 'StartTransaction':
        return { meterStart: params.meterStart, uid: params.idTag };
      case 'StopTransaction':
        return { meterStop: params.meterStop, uid: params.idTag };
      case 'Authorize':
        return { uid: params.idTag };
      case 'StatusNotification':
        return { connectorId: params.connectorId, status: params.status };
      case 'MeterValues':
        return { kwh: params?.meterValue[0]?.sampledValue[0]?.value };
      default:
        return null;
    }
  }
  if (protocol === 'ocpp2.0.1') {
    switch (method) {
      case 'StatusNotification':
        return { connectorId: params.connectorId, connectorStatus: params.connectorStatus };
      default:
        return null;
    }
  }
  return null;
}

