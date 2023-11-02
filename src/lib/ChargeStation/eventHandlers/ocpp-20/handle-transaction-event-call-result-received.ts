import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { TransactionEventRequest } from 'schemas/ocpp/2.0/TransactionEventRequest';
import { TransactionEventResponse } from 'schemas/ocpp/2.0/TransactionEventResponse';

const handleTransactionEventCallResultReceived: ChargeStationEventHandler<
  TransactionEventRequest,
  TransactionEventResponse
> = async ({
  session,
  emitter,
  chargepoint,
  callMessageBody,
  callResultMessageBody,
}) => {
  switch (callMessageBody.eventType) {
    case 'Started':
      if (callResultMessageBody.idTokenInfo?.status !== 'Accepted') {
        alert('Session start failed');
        await chargepoint.writeCall('StatusNotification', {
          timestamp: new Date().toISOString(),
          connectorStatus: 'Available',
          evseId: callMessageBody.evse?.id,
          connectorId: callMessageBody.evse?.connectorId,
        });
        return;
      }

      session.isStartingSession = false;

      if (callResultMessageBody.idTokenInfo?.status !== 'Accepted') {
        alert('Session start failed');
        await chargepoint.writeCall('StatusNotification', {
          timestamp: new Date().toISOString(),
          connectorStatus: 'Available',
          evseId: callMessageBody.evse?.id,
          connectorId: callMessageBody.evse?.connectorId,
        });

        await session.stop();

        delete chargepoint.sessions[session.connectorId];

        return;
      }

      await sleep(1000);
      session.tickInterval = setInterval(() => {
        session.tick(5);
      }, 5000);
      await sleep(500);
      session.tick(0);

      emitter.emitEvent(EventTypes.Charging);
      break;
    case 'Updated':
      break;
    case 'Ended':
      delete chargepoint.sessions[session.connectorId];
      break;
  }
};

export default handleTransactionEventCallResultReceived;
