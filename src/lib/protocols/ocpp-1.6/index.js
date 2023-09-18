class Connection {
  constructor(ocppBaseUrl, ocppIdentity) {
    this.ocppBaseUrl = ocppBaseUrl;
    this.ocppIdentity = ocppIdentity;
    this.ready = false;
    this.messageId = 1;
    this.commandCallbacks = {};
    this.incomingCommand;
  }

  connect() {
    const url = this.ocppBaseUrl + '/' + this.ocppIdentity;
    this.ws = new WebSocket(url, 'ocpp1.6');
    this.ws.addEventListener('open', () => {
      this.ready = true;
      this.onConnected && this.onConnected();
    });

    this.ws.addEventListener('message', (event) => {
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
    });

    this.ws.addEventListener('close', (event) => {
      this.onError &&
        this.onError(new Error(`WebSocket closed (no connection)`));
    });

    this.ws.addEventListener('error', (error) => {
      console.error(error);
      if (error.message) {
        this.onError &&
          this.onError(new Error(`WebSocket Error: ${error.message}`));
      }
    });
  }

  disconnect() {
    this.ws.close();
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
