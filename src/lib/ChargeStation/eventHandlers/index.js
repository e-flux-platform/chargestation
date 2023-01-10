import { EventEmitter } from 'node:events';
import { sleep } from '../../../utils/csv';

// Define a handler config for each different Chargestation model that does not follow the standard OCPP rules.
const basicChargestationHandlerConfig = {
  afterSessionStart: [authorizeHandler],
  afterSendAuthorize: [startTransactionHandler],
  afterSendStartTransaction: [statusNotificationPreparingHandler],
};

function mockedCommandEmitter(commandName, payload) {
  console.log(`Command ${commandName} sent!`);
}

// Register the event emitter and the handlers somewhere in the bootstrap code
const eventEmitter = new ChargepointEventEmitter(mockedCommandEmitter);

eventEmitter.registerHandlers(basicChargestationHandlerConfig);

export class ChargepointEventEmitter extends EventEmitter {
  constructor(sendCommand) {
    super();
    this.sendCommand = sendCommand;
  }

  registerHandlers(handlerConfig) {
    this.handlerConfig = handlerConfig;

    for (const [eventName, handlers] of Object.entries(handlerConfig)) {
      for (const handler of handlers) {
        this.on(eventName, handler);
      }
    }
  }

  emitEvent(eventName) {
    //TODO: Need to inject that session somewhere. Use empty object for now.
    this.emit(eventName, {}, this.sendCommand, this);
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

  eventEmitter.emitEvent('afterSendAuthorize');
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

  eventEmitter.emitEvent('afterSendStartTransaction');
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

  eventEmitter.emitEvent('afterSendStatusNotificationPreparing');
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
