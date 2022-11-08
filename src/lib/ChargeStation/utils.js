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

export function summarizeCommandParams({ method, params }) {
  if (method === 'StartTransaction') {
    return { meterStart: params.meterStart, uid: params.idTag };
  }
  if (method === 'StopTransaction') {
    return { meterStop: params.meterStop, uid: params.idTag };
  }
  if (method === 'Authorize') {
    return { uid: params.idTag };
  }
  if (method === 'StatusNotification') {
    return { status: params.status };
  }
  if (method === 'MeterValues') {
    return { kwh: params?.meterValue[0]?.sampledValue[0]?.value };
  }
  return null;
}
