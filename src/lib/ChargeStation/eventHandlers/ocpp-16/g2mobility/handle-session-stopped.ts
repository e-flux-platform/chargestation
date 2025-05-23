import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizationType } from 'lib/settings';

const vendorId = 'com.g2mobility';
const messageIdCardTxReport = 'CardTxReport';

export const calculateCostsAndSendReceipt: ChargeStationEventHandler = async (
  params
) => {
  const { session, chargepoint } = params;

  if (session.options.authorizationType !== AuthorizationType.CreditCard) {
    return; // session will stop the normal route
  }

  // There is no known configuration around this, so we just apply arbitrary costs
  const costPerMinute = 0.1;
  const costPerkWh = 1;
  const vatRate = 0.21;

  const startTime = session.startTime;
  const stopTime = session.stopTime as Date;
  const durationMinutes =
    (stopTime.getTime() - startTime.getTime()) / 1000 / 60;

  const durationCost = durationMinutes * costPerMinute;
  const kWhCost = session.kwhElapsed * costPerkWh;
  const sessionCost = durationCost + kWhCost;
  const sessionCostInclVat = sessionCost * (1 + vatRate);

  chargepoint.writeCall('DataTransfer', {
    vendorId,
    messageId: messageIdCardTxReport,
    data: JSON.stringify({
      tx_ID: Number(session.transactionId),
      tx_Time: new Date().toISOString(),
      priceSchemeID: 'FR*ABC',
      costID: `ABC${Math.floor(Math.random() * 999999)}`,
      totalTaxedCost: Number(sessionCostInclVat.toFixed(2)),
      customerTicket: 'CARTE BANCAIRE',
      report: 'CARTE BANCAIRE',
      priceCompliance: true,
    }),
  });
};
