import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';

const sendDataTransferReceipt: ChargeStationEventHandler = async ({
  chargepoint,
  session,
}) => {
  const data = {
    merchant: {
      name: '',
      address: '',
      taxId: '',
    },
    chargePoint: {
      serialNumber: 'deploymen',
      id: 'HYC_SIM_GIORGIO',
    },
    chargingProcess: {
      energyDelivered: 10160,
      chargingTime: 216,
      netValueEnergy: 0.92,
      netPriceEnergy: 0.09,
      netPriceTime: 0.09,
      netValueTime: 0.27,
      netValueTotal: 1.25,
      vat: 0.13,
      vatRate: 10,
      grossValue: 1.38,
    },
    paymentTransaction: {
      id: '17246',
      timestamp: '2022-09-27 08:32:53',
      language: '',
      receiptNo: '16977',
      aid: 'A0000000041010',
      vuNumber: '43219876',
      terminalId: 'cc_sim_1',
      stan: '',
      currency: 'EUR',
      paymentType: 'CTLS',
      card: {
        type: 'Mastercard',
        pan: '1234********5678',
        expiryDate: '2512',
      },
      authorization: {
        type: 'Online',
        code: '',
        acknowledgementCode: '',
      },
    },
    transactionId: session.transactionId,
    receiptString: '',
  };

  chargepoint.writeCall('DataTransfer', {
    vendorId: 'OnSitePay',
    data: JSON.stringify(data),
    messageId: 'Receipt',
  });
};

export default sendDataTransferReceipt;
