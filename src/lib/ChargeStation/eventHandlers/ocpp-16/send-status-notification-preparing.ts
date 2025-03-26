import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StatusNotificationRequest } from 'schemas/ocpp/1.6/StatusNotification';

const sendStatusNotificationPreparing: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  if (!session) return;

  if (chargepoint.currentStatus[session.connectorId] === 'Preparing') {
    return;
  }

  const statusNotification: StatusNotificationRequest = {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Preparing',
  };

  await chargepoint.writeCall(
    'StatusNotification',
    statusNotification,
    session
  );
};

export default sendStatusNotificationPreparing;
