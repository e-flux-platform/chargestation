// Class representing clock, used to enable 'time travel' in the simulation
class Clock {
  protected nowDate: Date;
  protected clockInterval?: ReturnType<typeof setInterval>;
  protected speed: number = 1;
  protected tickFrequency?: number; // updates per second

  constructor() {
    this.nowDate = new Date();
    this.tickWithFrequency(1);
  }

  public setSpeed(speed: number) {
    this.speed = speed;
    // the tick frequency is proportional to speed, with a min of 1 and a max of 10
    // - speed 1  = 1 update / second
    // - speed 5  = 1.66 updates / second
    // - speed 10 = 3.33 updates / second
    // - speed 15 = 5 updates / second
    // - speed 20 = 6.66 updates / second
    // - speed 25 = 8.33 updates / second
    // - speed 25 = 10 updates / second
    // - speed 30 = 10 updates / second
    // etc
    this.tickWithFrequency(Math.max(1, Math.min(10, speed / 3)));
  }

  public getSpeed() {
    return this.speed;
  }

  public secondsSince(since: Date) {
    return Math.round((this.nowDate.getTime() - since.getTime()) / 1000);
  }

  public reset() {
    this.setNow(new Date());
  }

  public setNow(date: Date) {
    this.nowDate = date;
  }

  public now() {
    return new Date(this.nowDate);
  }

  public setInterval(
    callback: Function,
    interval: number,
    name: string = ''
  ): Interval {
    return new Interval(this, callback, interval, name);
  }

  public adjustBySpeed(input: number): number {
    return Math.floor(input / this.speed);
  }

  private tickWithFrequency(tickFrequency: number) {
    if (tickFrequency === this.tickFrequency) {
      return; // no change
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    const ms = Math.round(1000 / tickFrequency);
    this.tickFrequency = tickFrequency;
    this.clockInterval = setInterval(() => {
      this.nowDate.setTime(this.nowDate.getTime() + ms * this.speed);
    }, ms);
  }
}

class Interval {
  protected timeoutHandle: NodeJS.Timeout | undefined;
  protected continue: boolean = false;

  constructor(
    protected readonly clock: Clock,
    protected readonly callback: Function,
    protected readonly interval: number,
    protected readonly name: string
  ) {
    this.start();
  }

  public start() {
    this.continue = true;
    this.tick();
  }

  public stop() {
    this.continue = false;
    clearTimeout(this.timeoutHandle);
  }

  protected tick() {
    if (this.continue) {
      this.timeoutHandle = setTimeout(() => {
        if (!this.continue) {
          return;
        }
        this.callback();
        this.tick();
      }, this.interval / this.clock.getSpeed());
    }
  }
}

const clock = new Clock();

export default clock;
export { Interval };
