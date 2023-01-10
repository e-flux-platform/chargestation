import { EventEmitter } from 'node:events';
import { sleep } from '../../../utils/csv';

// Define a handler config for each different Chargestation model that does not follow the standard OCPP rules.
const myCustomHandlerConfig = {
  afterSessionStart: [authorizeHandler],
  afterSendAuthorize: [startTransactionHandler],
  afterSendStartTransaction: [statusNotificationPreparingHandler],
};

// Register the event emitter and the handlers somewhere in the bootstrap code
const eventEmitter = new ChargepointEventEmitter();
eventEmitter.registerHandlers(myCustomHandlerConfig);

export class ChargepointEventEmitter extends EventEmitter {
  registerHandlers(handlerConfig) {
    this.handlerConfig = handlerConfig;

    for (const [eventName, handlers] of Object.entries(handlerConfig)) {
      for (const handler of handlers) {
        this.on(eventName, handler);
      }
    }
  }
}

// Define custom handlers for each event and put them in the handlerConfig
async function authorizeHandler(session, sendCommand, eventEmitter) {
  console.log('authorizing...');

  await sleep(1000);
  const authorizeResponse = await sendCommand('Authorize', {
    idTag: session.options.uid,
  });
  if (authorizeResponse.idTagInfo.status === 'Invalid') {
    throw new Error(
      `OCPP Server rejected our Token UID during Authorize: ${session.options.uid}`
    );
  }

  eventEmitter.emit('afterSendAuthorize');
}

async function startTransactionHandler(session, sendCommand, eventEmitter) {
  console.log('starting transaction');

  await sleep(1000);
  const startTransactionResponse = await sendCommand('StartTransaction', {
    connectorId: session.connectorId,
    idTag: session.options.uid,
    meterStart: Math.round(session.kwhElapsed * 1000),
    timestamp: session.now().toISOString(),
    reservationId: undefined,
  });

  await sleep(1000);
  if (startTransactionResponse.idTagInfo.status === 'Invalid') {
    throw new Error(
      `OCPP Server rejected our Token UID during StartTransaction: ${session.options.uid}`
    );
  }
  session.transactionId = startTransactionResponse.transactionId;

  eventEmitter.emit('afterSendStartTransaction');
}

async function statusNotificationPreparingHandler(
  session,
  sendCommand,
  eventEmitter
) {
  await sendCommand('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Preparing',
  });

  eventEmitter.emit('afterSendStatusNotificationPreparing');
}

// Possible handlers
// const handlers = {
//   beforeDisconnect: [],
//   afterConnect: [],
//   beforeBoot: [],
//   afterBoot: [],
//   beforeSessionStart: [],
//   afterSessionStart: [],
//   beforeSessionStop: [],
//   afterSessionStop: [],
//   beforeReceiveRemoteStartTransaction: [],
//   afterReceiveRemoteStartTransaction: [],
//   beforeReceiveRemoteStopTransaction: [],
//   afterReceiveRemoteStopTransaction: [],
//   beforeSendHeartbeat: [],
//   afterSendHeartbeat: [],
//   beforeSendAuthorize: [],
//   afterSendAuthorize: [],
//   beforeSendStartTransaction: [],
//   afterSendStartTransaction: [],
//   beforeSendStopTransaction: [],
//   afterSendStopTransaction: [],
//   beforeSendStatusNotificationPreparing: [],
//   afterSendStatusNotificationPreparing: [],
//   beforeSendMetervalues: [],
//   afterSendMeterValues: [],
// };
