class Connection {
  constructor(ocppBaseUrl, ocppIdentity, version) {
    this.ocppBaseUrl = ocppBaseUrl;
    this.ocppIdentity = ocppIdentity;
    this.version = version;
    this.ready = false;
    this.messageId = 1;
    this.commandCallbacks = {};
    this.incomingCommand;
    this.onConnected = null;
  }

  connect() {
    const url = this.ocppBaseUrl + '/' + this.ocppIdentity;
    this.ws = new WebSocket(url, this.version);

    this.ws.addEventListener('open', this.onOpen.bind(this));
    this.ws.addEventListener('message', this.onMessage.bind(this));
    this.ws.addEventListener('close', this.onClose.bind(this));
    this.ws.addEventListener('error', this.onError.bind(this));
  }

  disconnect() {
    this.ws.close();
  }

  onOpen() {
    this.ready = true;
    this.onConnected && this.onConnected();
  }

  onMessage(event) {
    const data = JSON.parse(event.data);
    if (data[0] === 3) {
      this.onReceiveCallResult(data[1], data[2]);
    } else if (data[0] === 2) {
      this.onReceiveCall(data[2], data[3], data[1]);
    } else if (data[0] === 4) {
      const command = this.commandCallbacks[data[1].toString()];
      if (command) {
        command.callback(
          new Error(
            `Command ${command.method} returned error: ${data[2]}: ${data[3]}`
          )
        );
      }
    } else {
      throw new Error(`Not implemented: ${JSON.stringify(data)}`);
    }
  }

  onClose(event) {
    this.onError && this.onError(new Error(`WebSocket closed (no connection)`));
  }

  onError(error) {
    console.error(error);
    if (error.message) {
      this.onError &&
        this.onError(new Error(`WebSocket Error: ${error.message}`));
    }
  }

  generateMessageId() {
    this.messageId++;
    return this.messageId.toString();
  }

  writeCall(method, params) {
    const messageId = this.generateMessageId();
    const formattedMessage = [2, messageId, method, params];
    this.ws.send(JSON.stringify(formattedMessage));
    return messageId;
  }

  writeCallResult(messageId, params) {
    const formattedMessage = [3, messageId, params];
    this.ws.send(JSON.stringify(formattedMessage));
  }
}

export { Connection };
