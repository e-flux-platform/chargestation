import { sleep } from 'utils/csv';

export default async function handleGetBaseReportReceived({
  chargepoint,
  callMessageId,
  callMessageBody,
}) {
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
}
