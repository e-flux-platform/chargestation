import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { MeterValuesRequest } from 'schemas/ocpp/1.6/MeterValues';

const sendMeterValues: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  const now = new Date();

  await chargepoint.writeCall<MeterValuesRequest>('MeterValues', {
    connectorId: session.connectorId,
    transactionId: Number(session.transactionId),
    meterValue: [
      {
        timestamp: now.toISOString(),
        sampledValue: [
          {
            value: session.kwhElapsed.toFixed(5),
            context: 'Sample.Periodic',
            measurand: 'Energy.Active.Import.Register',
            location: 'Outlet',
            unit: 'kWh',
          },
        ],
      },
    ],
  });
};

export default sendMeterValues;
