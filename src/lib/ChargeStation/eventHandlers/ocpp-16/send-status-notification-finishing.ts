import { sleep } from 'utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StatusNotificationRequest } from 'schemas/ocpp/1.6/StatusNotification';

const sendStatusNotificationFinishing: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  if (!session) return;

  await sleep(200);

  const statusNotification: StatusNotificationRequest = {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Finishing',
    info: 'Finishing',
  };

  await chargepoint.writeCall(
    'StatusNotification',
    statusNotification,
    session
  );
};

export default sendStatusNotificationFinishing;
