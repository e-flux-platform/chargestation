export default class PromiseQueue {
  private queue: Promise<void> = Promise.resolve();

  enqueue(operation: () => Promise<void>) {
    return new Promise((resolve, reject) => {
      this.queue = this.queue.then(operation).then(resolve).catch(reject);
    });
  }
}
