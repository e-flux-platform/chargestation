import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { AuthorizationType } from 'lib/settings';

const messageIdCardTxReport = 'CardTxReport';

export const calculateCostsAndSendReceipt: ChargeStationEventHandler = async (
  params
) => {
  const { session, chargepoint } = params;

  if (session.options.authorizationType !== AuthorizationType.CreditCard) {
    return; // session will stop the normal route
  }

  // Calculations below are just general approximations of how costs may be applied.
  const pricePerUnit = chargepoint.configuration.getVariableValue(
    'SCHED_1_PRICE_PER_UNIT'
  ) as string;
  const billingTable = chargepoint.configuration.getVariableValue(
    'SCHED_1_BILLING_TABLE'
  ) as string;

  if (pricePerUnit !== 'kWh') {
    throw new Error(`Unsupported pricePerUnit: ${pricePerUnit}`);
  }

  const parts = [];
  const regex = /\(([^)]+)\)/g;
  let match = regex.exec(billingTable);
  while (match !== null) {
    parts.push(match[1]);
    match = regex.exec(billingTable);
  }

  if (parts.length !== 1) {
    // We're just supporting the most basic form currently
    throw new Error(`Unsupported billing table: ${billingTable}`);
  }

  const kWhCost = session.kwhElapsed * parseFloat(parts[0].split(';')[1]);

  chargepoint.writeCall('DataTransfer', {
    vendorId: chargepoint.configuration.getVariableValue(
      'TPE_OCPP_VENDORID'
    ) as string,
    messageId: messageIdCardTxReport,
    data: JSON.stringify({
      tx_ID: Number(session.transactionId),
      tx_Time: new Date().toISOString(),
      totalTaxedCost: Number(kWhCost.toFixed(2)),
      customerTicket: 'CARTE BANCAIRE',
      report: 'CARTE BANCAIRE',
    }),
  });
};
