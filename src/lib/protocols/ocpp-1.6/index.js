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
    this.ws = new WebSocket(url);
    this.ws.addEventListener('open', () => {
      this.ready = true;
      this.onConnected && this.onConnected();
    });

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data[0] === 3) {
        const command = this.commandCallbacks[data[1].toString()];
        if (command.callback) {
          command.callback(null, data[2]);
        }
      } else if (data[0] === 2) {
        const result = this.onCommand(data[2], data[3]);
        const message = [3, data[1], result];
        this.ws.send(JSON.stringify(message));
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

  sendCommand(method, params) {
    return new Promise((resolve, reject) => {
      const messageId = this.messageId++;
      const message = [2, messageId.toString(), method, params];
      let responded = false;
      let timeout = setTimeout(() => {
        if (!responded) {
          reject(new Error(`Command ${method} did not respond in 30 seconds`));
        }
      }, 30000);
      this.commandCallbacks[messageId.toString()] = {
        method,
        callback: (error, response) => {
          responded = true;
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve(response);
          }
        },
      };
      this.ws.send(JSON.stringify(message));
    });
  }
}

export { Connection };
