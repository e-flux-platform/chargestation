import { sleep } from '../../../../utils/csv';
import { EventTypes16 } from '../event-types';

export default async function sendStopTransaction({
  chargepoint,
  emitter,
  session,
}) {
  chargepoint.sessions[session.connectorId].isStoppingSession = true;

  clearInterval(session.tickInterval);
  await sleep(1000);

  // TODO: Listen for failures
  await chargepoint.sendCommand('StopTransaction', {
    connectorId: session.connectorId,
    idTag: session.options.uid,
    meterStop: Math.round(session.kwhElapsed * 1000),
    timestamp: session.now().toISOString(),
    disconnectReason: 'EVDisconnected',
    transactionId: session.transactionId,
    transactionData: [
      {
        sampledValue: [
          {
            value: session.kwhElapsed.toString(),
            context: 'Sample.Periodic',
            format: 'Raw',
            measurand: 'Energy.Active.Import.Register',
            location: 'Outlet',
            unit: 'kWh',
          },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });

  delete chargepoint.sessions[session.connectorId];

  emitter.emitEvent(EventTypes16.StopTransactionAccepted, session);
}
