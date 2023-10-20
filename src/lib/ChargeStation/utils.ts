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
  switch (method) {
    case 'StartTransaction':
      return { meterStart, uid: idTag };
    case 'StopTransaction':
      return { meterStop, uid: idTag };
    case 'Authorize':
      return { uid: idTag };
    case 'StatusNotification':
      return { status };
    case 'MeterValues':
      return {
        kwh: meterValue ? meterValue[0]?.sampledValue[0]?.value : undefined,
      };
  }

  return null;
}

export function toCamelCase(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}
