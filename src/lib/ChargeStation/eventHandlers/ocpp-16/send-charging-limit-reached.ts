import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StatusNotificationRequest } from 'schemas/ocpp/1.6/StatusNotification';

const sendChargingLimitReached: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  await chargepoint.writeCall<StatusNotificationRequest>('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'SuspendedEV',
  });
};

export default sendChargingLimitReached;
