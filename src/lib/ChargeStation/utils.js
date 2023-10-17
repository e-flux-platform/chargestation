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

export function toCamelCase(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
