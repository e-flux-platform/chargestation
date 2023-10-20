interface SummarizeCommandParams {
  method: string;
  params: {
    meterStart?: number;
    meterStop?: number;
    idTag?: string;
    status?: string;
    meterValue?: {
      sampledValue: {
        value: number;
      }[];
    }[];
  };
}

export function summarizeCommandParams({
  method,
  params: { idTag, meterStart, meterStop, meterValue, status },
}: SummarizeCommandParams) {
  if (method === 'StartTransaction') {
    return { meterStart: meterStart, uid: idTag };
  }
  if (method === 'StopTransaction') {
    return { meterStop: meterStop, uid: idTag };
  }
  if (method === 'Authorize') {
    return { uid: idTag };
  }
  if (method === 'StatusNotification') {
    return { status: status };
  }
  if (method === 'MeterValues') {
    return {
      kwh: meterValue ? meterValue[0]?.sampledValue[0]?.value : undefined,
    };
  }
  return null;
}

export function toCamelCase(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
