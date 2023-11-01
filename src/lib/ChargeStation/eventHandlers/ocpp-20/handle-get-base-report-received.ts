import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { sleep } from 'utils/csv';

import { GetBaseReportRequest } from 'schemas/ocpp/2.0/GetBaseReportRequest';
import { GetBaseReportResponse } from 'schemas/ocpp/2.0/GetBaseReportResponse';

const handleGetBaseReportReceived: ChargeStationEventHandler<
  GetBaseReportRequest,
  GetBaseReportResponse
> = async ({ chargepoint, callMessageId, callMessageBody }) => {
  chargepoint.writeCallResult(callMessageId, { status: 'Accepted' });

  const sleepTime = 1000 * 2; // 2 seconds
  await sleep(sleepTime);

  const { requestId } = callMessageBody;

  const variables = chargepoint.configuration.getVariablesArray();
  const middleIndex = Math.ceil(variables.length / 2);
  const firstHalf = variables.splice(0, middleIndex);
  const secondHalf = variables.splice(-middleIndex);

  await chargepoint.writeCall('NotifyReport', {
    requestId,
    generatedAt: new Date().toISOString(),
    tbc: true,
    seqNo: 0,
    reportData: firstHalf,
  });

  await sleep(sleepTime);

  await chargepoint.writeCall('NotifyReport', {
    requestId,
    generatedAt: new Date().toISOString(),
    tbc: false,
    seqNo: 1,
    reportData: secondHalf,
  });
};

export default handleGetBaseReportReceived;
