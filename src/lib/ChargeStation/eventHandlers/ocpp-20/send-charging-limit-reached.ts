import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StatusNotificationRequest } from 'schemas/ocpp/2.0/StatusNotificationRequest';

const sendChargingLimitReached: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  await chargepoint.writeCall<StatusNotificationRequest>('StatusNotification', {
    connectorId: session.connectorId,
    evseId: 1,
    connectorStatus: 'Occupied',
    timestamp: new Date().toISOString(),
  });
};

export default sendChargingLimitReached;
