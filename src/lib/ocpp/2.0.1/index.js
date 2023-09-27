import { Connection } from '../connection';
import { sleep } from 'utils/csv';
import { ChargeState } from '../charge';
import { getConfigurationItem } from '../../settings';

const maxReportPageSize = 3;

export default class ChargingStation {
  constructor(configuration, options = {}) {
    this.configuration = configuration;
    this.options = options;
    this.sessions = {};
    this.numConnectionAttempts = 0;
    this.evseId = 1;
    this.currentStatus = {
      '1': 'Available',
      '2': 'Available',
    };
  }

  availableConnectors() {
    return ['1', '2'].filter((id) => !this.sessions[id]);
  }

  connect() {
    const ocppBaseUrl = this.options.ocppBaseUrl;
    const ocppIdentity = this.configuration['identity'];
    this.log('message', `> Connecting to ${ocppBaseUrl}/${ocppIdentity} with OCPP protocol 2.0.1`);
    this.connection = new Connection(ocppBaseUrl, ocppIdentity, 'ocpp2.0.1');
    this.connection.onConnected = () => {
      this.connected = true;
      this.log('message-response', '< Connected!');
      this.startHeartbeat();
      setTimeout(() => {
        this.sendBootNotification();
      }, 2000);
    };
    this.connection.onError = (error) => {
      if (!this.connected) {
        return;
      }
      this.log('error', error.message);
      this.disconnect();
      this.reconnect();
    };
    this.connection.onCommand = (method, params) => {
      let response = {};
      if (this['receive' + method]) {
        response = this['receive' + method](params);
      } else {
        console.warn(
          `Received command from Central Server, but no implementation is known: ${method}`
        );
      }
      this.log('command', `received ${method} command`, {
        destination: 'charge-point',
        requestReceivedAt: new Date(),
        request: { method, params },
        response,
        responseSentAt: new Date(),
        subprotocol: 'ocpp2.0.1',
      });
      return response;
    };
    this.connection.connect();
    this.numConnectionAttempts++;
  }

  disconnect() {
    this.stopHeartbeat();
    this.connection.disconnect();
    this.log('message', '> Disconnected');
    this.connected = false;
  }

  reconnect() {
    if (this.numConnectionAttempts > 100) {
      this.log('error', 'Too many connection attempts, giving up');
      return;
    }
    const numSeconds = this.numConnectionAttempts < 5 ? 5 : 30;
    this.log('message', `> Reconnecting in ${numSeconds} seconds`);
    setTimeout(() => {
      this.connection.connect();
      this.numConnectionAttempts++;
    }, numSeconds * 1000);
  }

  async powerOff() {
    for (const session of Object.values(this.sessions)) {
      await session.stop();
    }
    await this.disconnect();
  }

  async startSession(connectorId, session) {
    try {
      if (!this.connected) {
        throw new Error('Not connected to OCPP server, cannot start session');
      }
      this.sessions[connectorId] = new Session(connectorId, this.evseId, {
        ...session,
        sendCommand: this.sendCommand.bind(this),
        meterValuesInterval: parseInt(
          this.configuration['meter-value-sample-interval'] || '60',
          10
        ),
        getCurrentStatus: () => this.currentStatus[connectorId],
      });
      this.sessions[connectorId].isStartingSession = true;
      await this.sessions[connectorId].start();
      this.sessions[connectorId].isStartingSession = false;
      this.onSessionStart && this.onSessionStart(connectorId);
    } catch (error) {
      this.sessions[connectorId].isStartingSession = false;
      await this.stopSession(connectorId);
      this.error(error);
    }
  }

  async sendStatusNotification(connectorId, status) {
    if (!this.sessions[connectorId]) {
      return;
    }
    await this.sendCommand('StatusNotification', {
      evseId: this.evseId,
      connectorId,
      timestamp: new Date().toISOString(),
      connectorStatus: status,
    });
  }

  async stopSession(connectorId, statusFn) {
    try {
      if (this.sessions[connectorId]) {
        this.sessions[connectorId].isStoppingSession = true;
        statusFn && statusFn();
        await this.sessions[connectorId].stop();
      }
      delete this.sessions[connectorId];
    } catch (error) {
      this.error(error);
    }
  }

  hasRunningSession(connectorId) {
    return !!this.sessions[connectorId];
  }

  isStartingSession(connectorId) {
    return (
      this.sessions[connectorId] && this.sessions[connectorId].isStartingSession
    );
  }

  isStoppingSession(connectorId) {
    return (
      this.sessions[connectorId] && this.sessions[connectorId].isStoppingSession
    );
  }

  // Private
  now() {
    return new Date();
  }

  error(error) {
    this.onError && this.onError(error);
  }

  log(type, message, command = undefined) {
    const id = `${Date.now()}-${Math.random()}}`;
    this.onLog && this.onLog({ id, type, message, command });
  }

  startHeartbeat() {
    this.sendCommand('Heartbeat', {});
    this.heartbeatInterval = setInterval(() => {
      this.sendCommand('Heartbeat', {});
    }, parseInt(this.configuration['heartbeat-interval'] || '30', 10) * 1000);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
  }

  receiveGetBaseReport({ requestId }) {
    setTimeout(async () => {
      const generatedAt = this.now();
      let i = 0;
      let seqNo = 0;
      const notifyReport = async (reportData, tbc) => {
        await this.sendCommand('NotifyReport', {
          requestId,
          generatedAt,
          seqNo,
          tbc,
          reportData,
        });
        seqNo++;
      };
      let results = [];
      const entries = Object.entries(this.configuration).filter(([ key, ]) => {
        return '2.0.1' in getConfigurationItem(key).name;
      });
      for (const [key, value] of entries) {
        const item = getConfigurationItem(key);
        results.push({
          component: {
            name: item.component,
          },
          variable: {
            name: item.name['2.0.1']
          },
          variableAttribute: [
            {
              value: `${value}`,
              mutability: item.mutability,
              persistence: true,
              type: 'Actual'
            }
          ],
          variableCharacteristics: {
            dataType: item.dataType,
            supportsMonitoring: false,
            minLimit: 1,
            ...(item.minLimit !== undefined && {minLimit: item.minLimit}),
            ...(item.unit !== undefined && {unit: item.unit})
          }
        });
        if (results.length === maxReportPageSize) {
          await notifyReport(results, i < entries.length - 1);
          results = [];
        }
        i++;
      }
      if (results.length > 0) {
        await notifyReport(results, false);
      }
    }, 1000);

    return {
      status: 'Accepted',
    };
  }

  async sendBootNotification() {
    await this.sendCommand('BootNotification', {
      reason: 'PowerUp',
      chargingStation: {
        vendorName: this.options.chargePointVendor,
        model: this.options.chargePointModel,
        serialNumber: this.options.chargePointSerialNumber,
        firmwareVersion: 'v1-000',
        modem: {
          iccid: this.options.iccid,
          imsi: this.options.imsi,
        }
      },
    });
    await sleep(200);
    await this.sendCommand('StatusNotification', {
      evseId: this.evseId,
      connectorId: 1,
      timestamp: this.now().toISOString(),
      connectorStatus: 'Available',
    });
    await sleep(200);
    await this.sendCommand('StatusNotification', {
      evseId: this.evseId,
      connectorId: 2,
      timestamp: this.now().toISOString(),
      connectorStatus: 'Available',
    });
  }

  async sendCommand(method, params) {
    const requestSentAt = new Date();
    const response = await this.connection.sendCommand(method, params);
    this.log('command', `sent ${method} command`, {
      destination: 'central-server',
      requestSentAt,
      request: { method, params },
      response,
      responseReceivedAt: new Date(),
      subprotocol: 'ocpp2.0.1',
    });
    if (method === 'StatusNotification' && params.connectorStatus && params.connectorId) {
      this.currentStatus[params.connectorId] = params.connectorStatus;
    }
    return response;
  }
}

class Session {
  constructor(connectorId, evseId, options = {}) {
    this.connectorId = connectorId;
    this.transactionId = Math.random().toString(16).slice(2);
    this.evseId = evseId;
    this.sequenceNumber = 0;
    this.options = options;
    this.meterValuesInterval = options.meterValuesInterval || 60;
    this.charge = new ChargeState(options);
    this.started = true;
  }

  now() {
    return new Date();
  }

  async start() {
    await sleep(1000);
    const authorizeResponse = await this.options.sendCommand('Authorize', {
      idToken: {
        idToken: this.options.uid,
        type: 'Central',
      },
    });
    if (authorizeResponse.idTokenInfo.status === 'Invalid') {
      throw new Error(
        `OCPP Server rejected our Token UID during Authorize: ${this.options.uid}`
      );
    }
    await sleep(1000);
    const startTransactionResponse = await this.options.sendCommand('TransactionEvent', {
      eventType: 'Started',
      triggerReason: 'Authorized',
      timestamp: this.now().toISOString(),
      seqNo: this.sequenceNumber++,
      transactionInfo: {
        transactionId: this.transactionId,
        chargingState: 'EVConnected',
      },
      idToken: {
        idToken: this.options.uid,
        type: 'Central',
      },
      meterValue: [
        {
          sampledValue: [
            {
              value: this.charge.kwhElapsed.toFixed(5),
              context: 'Transaction.Begin',
              measurand: 'Energy.Active.Import.Register',
              location: 'Outlet',
              unitOfMeasure: {
                unit: 'kWh'
              }
            }
          ],
          timestamp: this.now().toISOString(),
        }
      ]
    });
    await sleep(1000);
    if (startTransactionResponse.idTokenInfo.status === 'Invalid') {
      throw new Error(
        `OCPP Server rejected our Token UID during StartTransaction: ${this.options.uid}`
      );
    }

    if (startTransactionResponse.idTokenInfo.status === 'ConcurrentTx') {
      throw new Error(
        `OCPP Server did not start transaction due to ConcurrentTx: ${this.options.uid}`
      );
    }

    this.started = true;

    await this.options.sendCommand('StatusNotification', {
      evseId: this.evseId,
      connectorId: this.connectorId,
      timestamp: this.now().toISOString(),
      connectorStatus: 'Occupied',
    });

    this.tickInterval = setInterval(() => {
      this.tick(5);
    }, 5000);
    await sleep(500);
    this.tick(0);
  }

  async stop() {
    clearInterval(this.tickInterval);
    if (this.started) {
      await sleep(1000);
      await this.options.sendCommand('TransactionEvent', {
        eventType: 'Ended',
        triggerReason: 'EVCommunicationLost',
        timestamp: this.now().toISOString(),
        seqNo: this.sequenceNumber++,
        transactionInfo: {
          transactionId: this.transactionId,
          stoppedReason: 'EVDisconnected',
        },
        idToken: {
          idToken: this.options.uid,
          type: 'Central',
        },
        meterValue: [
          {
            sampledValue: [
              {
                value: this.charge.kwhElapsed.toFixed(5),
                context: 'Transaction.Begin',
                measurand: 'Energy.Active.Import.Register',
                location: 'Outlet',
                unitOfMeasure: {
                  unit: 'kWh'
                }
              }
            ],
            timestamp: this.now().toISOString(),
          }
        ]
      });
    }
    await sleep(1000);
    await this.options.sendCommand('StatusNotification', {
      evseId: this.evseId,
      connectorId: this.connectorId,
      timestamp: this.now().toISOString(),
      connectorStatus: 'Available',
    });
  }

  async tick(secondsElapsed) {
    if (secondsElapsed === 0) {
      await this.options.sendCommand(
        'TransactionEvent',
        {
          eventType: 'update',
          triggerReason: 'ChargingStateChanged',
          timestamp: this.now().toISOString(),
          seqNo: this.sequenceNumber++,
          transactionInfo: {
            transactionId: this.transactionId,
            chargingState: 'Charging',
          },
        }
      );
      return;
    }

    if (
      this.charge.lastMeterValuesTimestamp &&
      this.charge.lastMeterValuesTimestamp >
      this.now() - this.meterValuesInterval * 1000
    ) {
      return;
    }

    const chargeLimitWasReached = this.charge.chargeLimitReached;
    this.charge.progress(this.options.getCurrentStatus() === 'Charging', secondsElapsed);

    if (!chargeLimitWasReached && this.charge.chargeLimitReached) {
      // We've just reached the charge limit, so let's send a ChargingStateChanged type event
      await this.options.sendCommand('TransactionEvent', {
        eventType: 'Updated',
        triggerReason: 'ChargingStateChanged',
        timestamp: this.now().toISOString(),
        seqNo: this.sequenceNumber++,
        transactionInfo: {
          transactionId: this.transactionId,
          chargingState: 'SuspendedEV',
        }
      });
    }

    await sleep(100);
    await this.options.sendCommand('TransactionEvent', {
      eventType: 'Updated',
      triggerReason: 'MeterValuePeriodic',
      timestamp: this.now().toISOString(),
      seqNo: this.sequenceNumber++,
      transactionInfo: {
        transactionId: this.transactionId,
        chargingState: this.charge.chargeLimitReached ? 'SuspendedEV' : 'Charging',
      },
      meterValue: [
        {
          sampledValue: [
            {
              value: this.charge.kwhElapsed.toFixed(5),
              context: 'Sample.Periodic',
              measurand: 'Energy.Active.Import.Register',
              location: 'Outlet',
              unitOfMeasure: {
                unit: 'kWh'
              }
            }
          ],
          timestamp: this.now().toISOString(),
        }
      ]
    });
  }
}
