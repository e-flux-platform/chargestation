import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';

import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

import { TransactionEventRequest } from 'schemas/ocpp/2.0/TransactionEventRequest';
import { TransactionEventResponse } from 'schemas/ocpp/2.0/TransactionEventResponse';

const handleTransactionEventCallResultReceived: ChargeStationEventHandler<
  TransactionEventRequest,
  TransactionEventResponse
> = async ({ session, emitter, chargepoint, callMessageBody }) => {
  switch (callMessageBody.eventType) {
    case 'Started':
      session.isStartingSession = false;

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
