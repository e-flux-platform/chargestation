import { sleep } from '../../../../utils/csv';
import { EventTypes } from '../event-types';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { TransactionEventRequest } from 'schemas/ocpp/2.0/TransactionEventRequest';
import { TransactionEventResponse } from 'schemas/ocpp/2.0/TransactionEventResponse';
import clock from '../../clock';
import sendStopTransaction from './send-stop-transaction';

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
      if (callResultMessageBody.idTokenInfo?.status === 'ConcurrentTx') {
        session.stopTime = new Date(); // Ensure stopTime is set
        await sendStopTransaction({ chargepoint, session });
        return;
      }
      if (callResultMessageBody.idTokenInfo?.status !== 'Accepted') {
        emitter.emitEvent(
          EventTypes.AuthorizationFailedDuringTransactionStart,
          { session }
        );
        return;
      }
      await sleep(1000);
      let timeSince = clock.now();
      session.tickInterval = clock.setInterval(() => {
        session.tick(clock.secondsSince(timeSince));
        timeSince = clock.now();
      }, 5000);
      await sleep(500);
      session.tick(0);
      emitter.emitEvent(EventTypes.Charging, { session });
      break;
    case 'Updated':
      break;
    case 'Ended':
      if (callResultMessageBody.idTokenInfo?.status !== 'Accepted') {
        emitter.emitEvent(EventTypes.AuthorizationFailedDuringTransactionStop, {
          session,
        });
        return;
      }
      emitter.emitEvent(EventTypes.Stopped, { session });
      delete chargepoint.sessions[session.connectorId];
      break;
  }
};

export default handleTransactionEventCallResultReceived;
