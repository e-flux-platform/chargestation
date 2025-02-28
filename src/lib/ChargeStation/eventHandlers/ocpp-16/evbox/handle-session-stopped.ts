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

  // Calculations below are just general approximations of how costs may be applied.
  const costPerMinute = chargepoint.configuration.getVariableValue(
    'TariffCostCtrlr.EMVDefaultProfile.CostPerMinute'
  ) as number;
  const costPerkWh = chargepoint.configuration.getVariableValue(
    'TariffCostCtrlr.EMVDefaultProfile.CostPerkWh'
  ) as number;

  const startTime = session.startTime;
  const stopTime = session.stopTime as Date;
  const durationMinutes =
    (stopTime.getTime() - startTime.getTime()) / 1000 / 60;

  const durationCost = durationMinutes * costPerMinute;
  const kWhCost = session.kwhElapsed * costPerkWh;
  const sessionCost = durationCost + kWhCost;

  chargepoint.writeCall('DataTransfer', {
    vendorId,
    messageId: messageIdCardTxReport,
    data: JSON.stringify({
      tx_ID: Number(session.transactionId),
      tx_Time: new Date().toISOString(),
      priceSchemeID: 'DEFAULT',
      costID: null,
      totalTaxedCost: Number(sessionCost.toFixed(2)),
      report: 'CARTE BANCAIRE',
    }),
  });
};
