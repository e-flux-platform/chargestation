import Queue from 'queue-promise';

enum MessageType {
  CALL = 2,
  CALL_RESULT = 3,
  CALL_ERROR = 4,
}

interface Inflight {
  messageId: string;
  resolve: () => void;
}

type Call = [MessageType, string, string, unknown];
type CallResult = [MessageType, string, unknown];
type CallError = [MessageType, string, string, string, unknown];

class Connection {
  private ocppBaseUrl: string;
  private ocppIdentity: string;
  private version: string;
  private ready: boolean;
  private messageId: number;
  private callQueue: Queue;
  private inflight: Inflight | undefined; // the call queue should guarantee only 1 inflight call at any point in time
  private inflightTimeoutMs: number = 10000; // time before we consider the inflight call lost
  onConnected: null | (() => unknown);
  private ws: WebSocket;
  connect = () => {};

  onReceiveCall = (method: string, payload: unknown, messageId: string) => {};
  onReceiveCallResult = (messageId: string, payload: string) => {};
  onReceiveCallError = (
    messageId: string,
    errorCode: string,
    errorDescription: string,
    errorDetails: string
  ) => {};

  constructor(ocppBaseUrl: string, ocppIdentity: string, version: string) {
    this.ocppBaseUrl = ocppBaseUrl;
    this.ocppIdentity = ocppIdentity;
    this.version = version;
    this.ready = false;
    this.messageId = 1;
    this.callQueue = new Queue({ concurrent: 1, interval: 50 });
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
    const messageTypeId = data[0];
    switch (messageTypeId) {
      case MessageType.CALL:
        this.onReceiveCall(data[2], data[3], data[1]);
        break;
      case MessageType.CALL_RESULT:
        this.resolveInflight(data[1]);
        this.onReceiveCallResult(data[1], data[2]);
        break;
      case MessageType.CALL_ERROR:
        this.resolveInflight(data[1]);
        this.onReceiveCallError(data[1], data[2], data[3], data[4]);
        break;
      default:
        throw new Error(`Invalid messageTypeId: ${messageTypeId}`);
    }
  }

  onClose() {
    console.error(`WebSocket closed (no connection)`);
  }

  onError(event: Event) {
    console.error(event);
  }

  resolveInflight(messageId: string) {
    // If the OCPP server has been slow to reply to messages, we may have timed out previous calls - so we need to make
    // sure the result/error that just arrived relates to the current call, and not a previous one we timed out.
    if (this.inflight?.messageId === messageId) {
      this.inflight.resolve();
    }
  }

  generateMessageId(): string {
    this.messageId++;
    return this.messageId.toString();
  }

  writeCall(method: string, params: object) {
    const messageId = this.generateMessageId();
    const formattedMessage: Call = [2, messageId, method, params];
    this.enqueueCall(formattedMessage);
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

  private enqueueCall(call: Call) {
    const messageId = call[1];

    this.callQueue.enqueue(() => {
      const promise = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.inflight = undefined;
          reject(
            new Error(
              `Call with message id ${messageId} timed out after ${this.inflightTimeoutMs / 1000} seconds`
            )
          );
        }, this.inflightTimeoutMs);

        this.inflight = {
          messageId,
          resolve: () => {
            this.inflight = undefined;
            clearTimeout(timeoutId);
            resolve();
          },
        };
      });

      // Send the CALL payload
      this.ws.send(JSON.stringify(call));

      return promise;
    });
  }
}

export { Connection };
