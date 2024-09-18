import { DataTransferResponse } from 'schemas/ocpp/1.6/DataTransferResponse';
import { ChargeStationEventHandler } from 'lib/ChargeStation/eventHandlers';
import { DataTransferRequest } from 'schemas/ocpp/1.6/DataTransfer';
import ChargeStation, { Session } from 'lib/ChargeStation';
import { AuthorizationType } from 'lib/settings';

interface CostCalculationRequest {
  transactionId: number;
  meterStop: number;
  timestamp: string;
}

interface CostCalculationResponse {
  prixCents: number;
  ticketId: string;
}

const vendorId = 'fr.e-totem';
const messageIdPriceRequest = 'EtotemTpeDemandePrix';
const messageIdOnlineReceipt = 'EtotemTpeCRonline';
const messageIdOfflineReceipt = 'EtotemTpeCRoffline';

const stoppedSessions = new Map<string, Session>();

export const calculateCostsAndSendReceipt: ChargeStationEventHandler = async (
  params
) => {
  const { session, chargepoint } = params;

  if (session.options.authorizationType !== AuthorizationType.CreditCard) {
    return; // session will stop the normal route
  }

  if (!session.stopTime) {
    throw new Error('stopTime must be set');
  }

  if (chargepoint.settings.eTotemTerminalMode === 'etotem') {
    // Request online price, receipt will be sent once we get a result
    stoppedSessions.set(session.transactionId.toString(), session);
    const request: CostCalculationRequest = {
      transactionId: Number(session.transactionId),
      meterStop: Math.round(session.kwhElapsed * 1000),
      timestamp: (session.stopTime as Date).toISOString(),
    };
    chargepoint.writeCall('DataTransfer', {
      vendorId,
      messageId: messageIdPriceRequest,
      data: JSON.stringify(request),
    });
  } else {
    // Otherwise the station is configured to always use offline
    const price = calculatePriceOffline(chargepoint, session);
    sendOfflineReceipt(chargepoint, session, price);
  }
};

export const processDataTransferResult: ChargeStationEventHandler<
  DataTransferRequest,
  DataTransferResponse
> = async (params) => {
  const { callMessageBody, callResultMessageBody, chargepoint } = params;

  if (callMessageBody.vendorId !== vendorId) {
    return;
  }

  if (callMessageBody.messageId === messageIdPriceRequest) {
    if (callMessageBody.data === undefined) {
      throw new Error(`Call message body must be defined`);
    }

    // Retrieve the stopped session, as it is no longer available in the chargepoint..
    // TODO: should we keep hold of historical sessions on the chargepoint to make this less clunky?
    const request = JSON.parse(callMessageBody.data) as CostCalculationRequest;
    const transactionId = request.transactionId.toString();
    const session = stoppedSessions.get(transactionId);
    if (!session) {
      throw new Error(`Failed to locate session: ${request.transactionId}`);
    }
    stoppedSessions.delete(transactionId);

    const { status, data } = callResultMessageBody;
    if (status === 'Accepted' && data !== undefined) {
      const response = JSON.parse(data) as CostCalculationResponse;
      sendOnlineReceipt(chargepoint, session, response);
    } else {
      console.warn('e-Totem: online cost calculation failed, using offline');
      const price = calculatePriceOffline(chargepoint, session);
      sendOfflineReceipt(chargepoint, session, price);
    }
  }
};

const calculatePriceOffline = (
  chargepoint: ChargeStation,
  session: Session
): number => {
  const calculationMode = chargepoint.settings.eTotemCostCalculationMode;
  const startTime = session.startTime;
  const stopTime = session.stopTime as Date;

  if (calculationMode === 'Legacy') {
    return chargepoint.settings.eTotemFlatRateAmount;
  }

  const sessionCosts = chargepoint.settings.eTotemPerSessionAmount;

  const periods =
    (stopTime.getTime() - startTime.getTime()) /
    1000 /
    chargepoint.settings.eTotemPeriodDuration;
  const timeCosts = periods * chargepoint.settings.eTotemPerPeriodAmount;

  const kWhCosts =
    (calculationMode === 'DureeConsoSession'
      ? Math.ceil(session.kwhElapsed)
      : session.kwhElapsed) * chargepoint.settings.eTotemPerKWhAmount;

  return Math.round(sessionCosts + timeCosts + kWhCosts);
};

const sendOfflineReceipt = (
  chargepoint: ChargeStation,
  session: Session,
  price: number
) => {
  chargepoint.writeCall('DataTransfer', {
    vendorId,
    messageId: messageIdOfflineReceipt,
    data: JSON.stringify({
      transactionId: Number(session.transactionId),
      meterStop: Math.round(session.kwhElapsed * 1000),
      timestamp: session.stopTime?.toISOString(),
      prixCents: price,
      ticketId: `ABC${Math.floor(Math.random() * 999999)}`,
      numTpe: '123456',
      status: 'Succeed',
      ticketCaisse: buildReceipt(session, price),
    }),
  });
};

const sendOnlineReceipt = (
  chargepoint: ChargeStation,
  session: Session,
  costCalculation: CostCalculationResponse
) => {
  chargepoint.writeCall('DataTransfer', {
    vendorId,
    messageId: messageIdOnlineReceipt,
    data: JSON.stringify({
      ticketId: costCalculation.ticketId,
      numTpe: '123456',
      status: 'Succeed',
      ticketCaisse: buildReceipt(session, costCalculation.prixCents),
    }),
  });
};

const buildReceipt = (session: Session, price: number): string => {
  const now = session.now();

  const formattedDate = [
    now.getDate().toString().padStart(2, '0'),
    now.getMonth().toString().padStart(2, '0'),
    now.getFullYear().toString().substring(2, 4),
  ].join('/');

  const formattedTime = [
    now.getHours().toString().padStart(2, '0'),
    now.getMinutes().toString().padStart(2, '0'),
    now.getSeconds().toString().padStart(2, '0'),
  ].join(':');

  const formattedPrice = (price / 100).toLocaleString('fr-FR', {
    maximumFractionDigits: 2,
  });

  return [
    ' CARTE BANCAIRE',
    ' SANS CONTACT',
    'CREDIT AGRICOLE',
    'A0000000111111',
    'CB CLEO',
    `le ${formattedDate} a ${formattedTime}`,
    'E TOTEM',
    'SAINT-ETIENNE',
    '40000',
    '2413823',
    '14123',
    '51234500000000',
    '************1234',
    'C1230F00AB1AB1A1',
    '123 001 123123',
    'C @',
    'No AUTO : 123123',
    'MONTANT REEL=',
    ` ${formattedPrice} EUR`,
    'DEBIT',
    ' TICKET CLIENT',
    ' A CONSERVER',
    'MERCI AU REVOIR',
    'GAA1AAA8XA',
  ].join('\n');
};
