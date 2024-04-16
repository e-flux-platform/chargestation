import { sleep } from '../../../../utils/csv';

export default async function sendStopTransaction({ chargepoint, session }) {
  chargepoint.sessions[session.connectorId].isStoppingSession = true;

  chargepoint.sessions[session.connectorId].tickInterval?.stop();
  await sleep(1000);

  await chargepoint.writeCall(
    'StopTransaction',
    {
      idTag: session.options.uid,
      meterStop: Math.round(session.kwhElapsed * 1000),
      timestamp: session.now().toISOString(),
      reason: 'EVDisconnected',
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
