import { sleep } from '../../../../utils/csv';

export default async function sendStopTransaction({ chargepoint, session }) {
  chargepoint.sessions[session.connectorId].isStoppingSession = true;

  session.tickInterval.stop();
  await sleep(1000);

  await chargepoint.writeCall(
    'StopTransaction',
    {
      connectorId: session.connectorId,
      idTag: session.options.uid,
      meterStop: Math.round(session.kwhElapsed * 1000),
      timestamp: session.now().toISOString(),
      disconnectReason: 'EVDisconnected',
      transactionId: Number(session.transactionId),
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
          timestamp: session.now().toISOString(),
        },
      ],
    },
    session
  );
}
