import { EventEmitter } from 'events';
import { sleep } from '../../../utils/csv';

// Define a handler config for each different Chargestation model that does not follow the standard OCPP rules.
const defaultHandlerConfig = {
  stationBooted: [],
  stationConnected: [sendBootNotification],
  bootNotificationAccepted: [sendStatusNotificationActive, sendHeartbeat],
  heartbeatSent: [sendHeartbeatDelayed],
  // stationPreparing: [sendStatusNotificationPreparing],
  // stationCharging: [sendStatusNotificationCharging],
  // stationAvailable: [sendStatusNotificationAvailable],
  sessionStartedAttempt: [sendAuthorize],
  sessionStoppedAttempt: [sendStopTransaction],
  sessionAuthorizationFailed: [handleTokenRejection],
  sessionAuthorizationAccepted: [sendStartTransaction],
  sessionAuthorizationFailedDuringStartTransaction: [handleTokenRejection],
  startTransactionAccepted: [sendStatusNotificationPreparing, startCharging],
  stopTransactionAccepted: [sendStatusNotificationAvailable],
  evCharging: [sendStatusNotificationCharging],
  sessionCancelled: [sendStatusNotificationAvailable],
  // sessionStopped: [],
};

function mockedCommandEmitter(commandName, payload) {
  console.log(`Command ${commandName} sent!`);
}

export function createEventEmitter(chargepoint) {
  const emitter = new ChargepointEventEmitter(chargepoint);
  emitter.registerHandlers(defaultHandlerConfig);
  return emitter;
}

export class ChargepointEventEmitter extends EventEmitter {
  constructor(chargepoint) {
    super();
    this.chargepoint = chargepoint;
  }

  registerHandlers(handlerConfig) {
    this.handlerConfig = handlerConfig;

    for (const [eventName, handlers] of Object.entries(handlerConfig)) {
      for (const handler of handlers) {
        this.on(eventName, handler);
      }
    }
  }

  emitEvent(eventName, session) {
    console.log(`Emitting event ${eventName}`);
    this.emit(eventName, this.chargepoint, this, session);
  }
}

async function sendBootNotification(chargepoint, emitter) {
  await sleep(2000);
  console.log(chargepoint);
  await chargepoint.sendCommand('BootNotification', {
    chargePointVendor: chargepoint.options.chargePointVendor,
    chargePointModel: chargepoint.options.chargePointModel,
    chargePointSerialNumber: chargepoint.options.chargePointSerialNumber,
    chargeBoxSerialNumber: chargepoint.configuration.Identity,
    firmwareVersion: 'v1-000',
    iccid: chargepoint.options.iccid,
    imsi: chargepoint.options.imsi,
  });
  emitter.emitEvent('bootNotificationAccepted');
}

async function sendHeartbeat(chargepoint, emitter) {
  await sleep(1000);
  await chargepoint.sendCommand('Heartbeat', {});
  emitter.emitEvent('heartbeatSent');
}

async function sendHeartbeatDelayed(chargepoint, emitter) {
  const interval =
    parseInt(chargepoint.configuration['HeartbeatInterval'] || '30', 10) * 1000;

  await sleep(interval);
  if (chargepoint.connected) {
    await chargepoint.sendCommand('Heartbeat', {});
    emitter.emitEvent('heartbeatSent');
  }
}

async function sendStatusNotificationActive(chargepoint, emitter) {
  await sleep(200);

  await chargepoint.sendCommand('StatusNotification', {
    connectorId: 1,
    errorCode: 'NoError',
    status: 'Available',
  });
  await sleep(200);
  await chargepoint.sendCommand('StatusNotification', {
    connectorId: 2,
    errorCode: 'NoError',
    status: 'Available',
  });
}

async function sendStatusNotificationAvailable(chargepoint, emitter, session) {
  await sleep(200);

  await chargepoint.sendCommand('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Available',
  });
}

// Define custom handlers for each event and put them in the handlerConfig
async function sendAuthorize(chargepoint, emitter, session) {
  await sleep(1000);
  const authorizeResponse = await session.options.sendCommand('Authorize', {
    idTag: session.options.uid,
  });
  if (authorizeResponse.idTagInfo.status === 'Invalid') {
    emitter.emitEvent('sessionAuthorizationFailed', session);
    return;
  }

  emitter.emitEvent('sessionAuthorizationAccepted', session);
}

async function sendStopTransaction(chargepoint, emitter, session) {
  chargepoint.sessions[session.connectorId].isStoppingSession = true;
  // statusFn && statusFn();

  clearInterval(session.tickInterval);
  await sleep(1000);

  // TODO: Listen for failures
  await chargepoint.sendCommand('StopTransaction', {
    connectorId: session.connectorId,
    idTag: session.options.uid,
    meterStop: Math.round(session.kwhElapsed * 1000),
    timestamp: session.now().toISOString(),
    disconnectReason: 'EVDisconnected',
    transactionId: session.transactionId,
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
        timestamp: new Date().toISOString(),
      },
    ],
  });

  delete chargepoint.sessions[session.connectorId];

  emitter.emitEvent('stopTransactionAccepted', session);
}

async function cancelSession(chargepoint, emitter, session) {
  try {
    if (chargepoint.sessions[session.connectorId]) {
      return;
    }

    chargepoint.sessions[session.connectorId].isStartingSession = false;
    chargepoint.sessions[session.connectorId].isStoppingSession = true;
    clearInterval(chargepoint.tickInterval);
    await sleep(1000);

    delete chargepoint.sessions[connectorId];
  } catch (error) {
    chargepoint.error(error);
  }
}

async function handleTokenRejection(chargepoint, emitter, session) {
  await cancelSession(chargepoint, emitter, session);
  emitter.emitEvent('sessionCancelled', session);
}

async function sendStartTransaction(chargepoint, emitter, session) {
  chargepoint.sessions[session.connectorId].isStartingSession = true;

  await sleep(1000);
  const startTransactionResponse = await session.options.sendCommand(
    'StartTransaction',
    {
      connectorId: session.connectorId,
      idTag: session.options.uid,
      meterStart: Math.round(session.kwhElapsed * 1000),
      timestamp: session.now().toISOString(),
      reservationId: undefined,
    }
  );

  await sleep(1000);
  if (startTransactionResponse.idTagInfo.status === 'Invalid') {
    emitter.emitEvent(
      'sessionAuthorizationFailedDuringStartTransaction',
      session
    );
    return;
  }
  session.transactionId = startTransactionResponse.transactionId;
  chargepoint.sessions[session.connectorId].isStartingSession = false;

  // this.onSessionStart && this.onSessionStart(connectorId);

  emitter.emitEvent('startTransactionAccepted', session);
}

async function startCharging(chargepoint, emitter, session) {
  await sleep(1000);
  session.tickInterval = setInterval(() => {
    session.tick(5);
  }, 5000);
  await sleep(500);
  session.tick(0);

  emitter.emitEvent('evCharging', session);
}

async function sendStatusNotificationPreparing(chargepoint, emitter, session) {
  await chargepoint.sendCommand('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Preparing',
  });
}

async function sendStatusNotificationCharging(chargepoint, emitter, session) {
  await chargepoint.sendCommand('StatusNotification', {
    connectorId: session.connectorId,
    errorCode: 'NoError',
    status: 'Charging',
    info: 'Charging',
  });
}
