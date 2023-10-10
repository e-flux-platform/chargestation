import { configurationList201, getConfiguration } from 'lib/settings';
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

  const list = [...configurationList201];
  const middleIndex = Math.ceil(list.length / 2);
  const firstHalf = list.splice(0, middleIndex);
  const secondHalf = list.splice(-middleIndex);

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
