import { configurationList201 } from 'lib/settings';
import { sleep } from '../../../../utils/csv';

export default async function sendNotifyReportRequest(params) {
  console.log(params);

  const sleepTime = 1000 * 2; // 2 seconds
  await sleep(sleepTime);

  const list = [...configurationList201];
  const middleIndex = Math.ceil(list.length / 2);
  const firstHalf = list.splice(0, middleIndex);
  const secondHalf = list.splice(-middleIndex);

  await chargepoint.writeCall('NotifyReport', {
    requestId: 2, // TODO
    generatedAt: new Date().toISOString(),
    tbc: true,
    seqNo: 0,
    reportData: firstHalf,
  });

  await sleep(sleepTime);

  await chargepoint.writeCall('NotifyReport', {
    requestId: 2, // TODO
    generatedAt: new Date().toISOString(),
    tbc: true,
    seqNo: 1,
    reportData: secondHalf,
  });
}
