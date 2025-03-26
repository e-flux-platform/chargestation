import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StatusNotificationRequest } from 'schemas/ocpp/1.6/StatusNotification';

const sendStatusNotificationCharging: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  if (!session) return;

  const statusNotification: StatusNotificationRequest = {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Charging',
    info: 'Charging',
  };

  await chargepoint.writeCall(
    'StatusNotification',
    statusNotification,
    session
  );
};

export default sendStatusNotificationCharging;
