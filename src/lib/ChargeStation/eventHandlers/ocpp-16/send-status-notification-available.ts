import { sleep } from '../../../../utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StatusNotificationRequest } from 'schemas/ocpp/1.6/StatusNotification';

const sendStatusNotificationAvailable: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  await sleep(1000);

  if (session?.connectorId) {
    const statusNotification: StatusNotificationRequest = {
      connectorId: session.connectorId,
      errorCode: 'NoError',
      status: 'Available',
    };

    await chargepoint.writeCall('StatusNotification', statusNotification);
    return;
  }

  const numConnectors =
    chargepoint.configuration.getVariableValue('NumberOfConnectors');
  if (numConnectors) {
    for (let i = 0; i < Number(numConnectors); i++) {
      const statusNotification: StatusNotificationRequest = {
        connectorId: i + 1,
        errorCode: 'NoError',
        status: 'Available',
      };

      await chargepoint.writeCall(
        'StatusNotification',
        statusNotification,
        session
      );
    }
  }
};

export default sendStatusNotificationAvailable;
