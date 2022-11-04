import { extractOcppBaseUrlFromConfiguration } from './utils';
import { Connection } from '../protocols/ocpp-1.6';
import { sleep } from 'utils/csv';

export default class ChargeStation {
  constructor(configuration, options = {}) {
    this.configuration = configuration;
    this.options = options;
    this.sessions = {};
  }
  connect() {
    const ocppBaseUrl =
      extractOcppBaseUrlFromConfiguration(this.configuration) ||
      this.options.ocppBaseUrl;
    const ocppIdentity = this.configuration['Identity'];
    this.log('message', `> Connecting to ${ocppBaseUrl}/${ocppIdentity}`);
    this.connection = new Connection(ocppBaseUrl, ocppIdentity);
    this.connection.onConnected = () => {
      this.log('message-response', '< Connected!');
      this.startHeartbeat();
      setTimeout(() => {
        this.sendBootNotification();
      }, 2000);
    };
    this.connection.onError = (error) => {
      this.log('error', error.message);
      this.stopHeartbeat();
    };
    this.connection.connect();
  }
  disconnect() {
    this.connection.disconnect();
    this.stopHeartbeat();
  }
  async startSession(connectorId, session) {
    this.sessions[connectorId] = new Session(connectorId, {
      ...session,
      sendCommand: this.sendCommand.bind(this),
    });
    await this.sessions[connectorId].start();
  }
  async stopSession(connectorId) {
    if (this.sessions[connectorId]) {
      await this.sessions[connectorId].stop();
    }
    delete this.sessions[connectorId];
  }
  hasRunningSession(connectorId) {
    return !!this.sessions[connectorId];
  }

  // Private

  log(type, message, command = undefined) {
    this.onLog && this.onLog({ id: Date.now(), type, message, command });
  }

  startHeartbeat() {
    this.sendCommand('Heartbeat', {});
    this.heartbeatInterval = setInterval(() => {
      this.sendCommand('Heartbeat', {});
    }, parseInt(this.configuration['HeartbeatInterval'] || '30', 10) * 1000);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
  }

  sendBootNotification() {
    this.sendCommand('BootNotification', {
      chargePointVendor: this.options.chargePointVendor,
      chargePointModel: this.options.chargePointModel,
      chargePointSerialNumber: this.options.chargePointSerialNumber,
      chargeBoxSerialNumber: this.configuration.Identity,
      firmwareVersion: 'v1-000',
      iccid: this.options.iccid,
      imsi: this.options.imsi,
    });
  }

  async sendCommand(method, params) {
    const response = await this.connection.sendCommand(method, params);
    this.log('command', `sent ${method} command`, {
      request: { method, params },
      response,
    });
  }
}

class Session {
  constructor(connectorId, options = {}) {
    this.connectorId = connectorId;
    this.options = options;
  }
  async start() {
    const response = await this.options.sendCommand('Authorize', {
      idTag: this.options.uid,
    });
    console.log('authorize response', response);
  }
  stop() {}
}
