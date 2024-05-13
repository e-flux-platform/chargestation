import { sleep } from 'utils/csv';

export default async function sendStatusNotificationFinishing({
  chargepoint,
  session,
}) {
  sleep(200);
  await chargepoint.writeCall(
    'StatusNotification',
    {
      connectorId: session.connectorId,
      errorCode: 'NoError',
      status: 'Finishing',
      info: 'Finishing',
    },
    session
  );
}
