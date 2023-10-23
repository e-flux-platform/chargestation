enum MessageType {
  CALL = 2,
  CALL_RESULT = 3,
  CALL_ERROR = 4,
}

type Call = [MessageType, string, string, unknown];
type CallResult = [MessageType, string, unknown];
type CallError = [MessageType, string, string, string, unknown];

interface CommandCallback {
  method: string;
  callback: (...params: unknown[]) => unknown;
}

class Connection {
  private ocppBaseUrl: string;
  private ocppIdentity: string;
  private version: string;
  private ready: boolean;
  private messageId: number;
  private commandCallbacks: {
    [key: string]: CommandCallback;
  };
  private incomingCommand: unknown;
  onConnected: null | (() => unknown);
  private ws: WebSocket;
  connect = () => {};

  onReceiveCall = (method: string, payload: unknown, messageId: string) => {};
  onReceiveCallResult = (messageId: string, payload: unknown) => {};

  constructor(ocppBaseUrl: string, ocppIdentity: string, version: string) {
    this.ocppBaseUrl = ocppBaseUrl;
    this.ocppIdentity = ocppIdentity;
    this.version = version;
    this.ready = false;
    this.messageId = 1;
    this.commandCallbacks = {};
    this.incomingCommand;
    this.onConnected = null;

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

  onMessage(event: MessageEvent) {
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

  onClose() {
    console.error(`WebSocket closed (no connection)`);
  }

  onError(event: Event) {
    console.error(event);
  }

  generateMessageId(): string {
    this.messageId++;
    return this.messageId.toString();
  }

  writeCall(method: string, params: object) {
    const messageId = this.generateMessageId();
    const formattedMessage: Call = [2, messageId, method, params];
    this.ws.send(JSON.stringify(formattedMessage));
    return messageId;
  }

  writeCallResult(messageId: string, params: object) {
    const formattedMessage: CallResult = [3, messageId, params];
    this.ws.send(JSON.stringify(formattedMessage));
  }

  writeCallError(
    messageId: string,
    code: string,
    description: string,
    details: object
  ) {
    const formattedMessage: CallError = [
      4,
      messageId,
      code,
      description,
      details,
    ];
    this.ws.send(JSON.stringify(formattedMessage));
  }
}

export { Connection };
