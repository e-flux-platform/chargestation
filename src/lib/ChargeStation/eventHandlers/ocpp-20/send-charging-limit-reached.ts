import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StatusNotificationRequest } from 'schemas/ocpp/2.0/StatusNotificationRequest';

import clock from '../../clock';

const sendChargingLimitReached: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  await chargepoint.writeCall<StatusNotificationRequest>('StatusNotification', {
    connectorId: session.connectorId,
    evseId: 1,
    connectorStatus: 'Occupied',
    timestamp: clock.now().toISOString(),
  });
};

export default sendChargingLimitReached;
