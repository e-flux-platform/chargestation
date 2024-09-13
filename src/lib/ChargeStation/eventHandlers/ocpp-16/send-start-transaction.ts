import { sleep } from '../../../../utils/csv';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { StartTransactionRequest } from 'schemas/ocpp/1.6/StartTransaction';

const sendStartTransaction: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  chargepoint.sessions[session.connectorId].isStartingSession = true;
  await sleep(1000);
  chargepoint.writeCall<StartTransactionRequest>(
    'StartTransaction',
    {
      connectorId: session.connectorId,
      idTag: session.options.uid,
      meterStart: Math.round(session.kwhElapsed * 1000),
      timestamp: session.now().toISOString(),
      reservationId: undefined,
    },
    session
  );
};

export default sendStartTransaction;
