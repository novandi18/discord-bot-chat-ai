export class QueueBase {
  constructor(name, delay = 5000) {
    this.name = name;
    this.queue = [];
    this.isProcessing = false;
    this.delay = delay;
  }

  add(item) {
    this.queue.push({
      ...item,
      timestamp: Date.now(),
    });

    if (!this.isProcessing) {
      this.processQueue();
    }

    return this.queue.length;
  }

  size() {
    return this.queue.length;
  }

  getInfo() {
    return {
      name: this.name,
      size: this.queue.length,
      isProcessing: this.isProcessing,
    };
  }

  async processNext() {
    throw new Error("processNext must be implemented by subclass");
  }

  async processQueue() {
    if (!this.queue.length) {
      this.isProcessing = false;
      return;
    }

    this.isProcessing = true;

    try {
      await this.processNext();
    } catch (error) {
      console.error(`Error processing queue ${this.name}:`, error);
    }

    setTimeout(() => {
      this.processQueue();
    }, this.delay);
  }
}
