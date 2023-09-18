import { sleep } from '../../../../utils/csv';

export default async function sendStartTransaction({ chargepoint, session }) {
  chargepoint.sessions[session.connectorId].isStartingSession = true;

  await sleep(1000);
  await session.options.writeCall('StartTransaction', {
    connectorId: session.connectorId,
    idTag: session.options.uid,
    meterStart: Math.round(session.kwhElapsed * 1000),
    timestamp: session.now().toISOString(),
    reservationId: undefined,
  });
}
