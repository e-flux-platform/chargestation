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
      case 'GetBaseReport':
        return { requestId: params.requestId, reportBase: params.reportBase };
      case 'StatusNotification':
        return { connectorId: params.connectorId, connectorStatus: params.connectorStatus };
      case 'NotifyReport':
        return { requestId: params.requestId, seqNo: params.seqNo, tbc: params.tbc ? 'true' : 'false' };
      default:
        return null;
    }
  }
  return null;
}

