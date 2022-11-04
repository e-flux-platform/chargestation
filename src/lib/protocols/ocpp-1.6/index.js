class Connection {
  constructor(ocppBaseUrl, ocppIdentity) {
    this.ocppBaseUrl = ocppBaseUrl;
    this.ocppIdentity = ocppIdentity;
    this.ready = false;
    this.messageId = 1;
    this.commandCallbacks = {};
  }

  connect() {
    const url = this.ocppBaseUrl + '/' + this.ocppIdentity;
    this.ws = new WebSocket(url);
    this.ws.addEventListener('open', () => {
      this.ready = true;
      this.onConnected && this.onConnected();
    });

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log('message data', data);
      if (data[0] === 3) {
        const callback = this.commandCallbacks[data[1].toString()];
        if (callback) {
          callback(data[2]);
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

  sendCommand(method, params) {
    return new Promise((resolve, reject) => {
      const messageId = this.messageId++;
      const message = [2, messageId.toString(), method, params];
      let responded = false;
      let timeout = setTimeout(() => {
        if (!responded) {
          reject(new Error(`Command ${method} did not respond in 5 seconds`));
        }
      }, 5000);
      this.commandCallbacks[messageId.toString()] = (response) => {
        responded = true;
        clearTimeout(timeout);
        resolve(response);
      };
      this.ws.send(JSON.stringify(message));
    });
  }
}

export { Connection };
