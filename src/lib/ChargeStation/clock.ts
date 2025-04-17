// Class representing clock, used to enable 'time travel' in the simulation
class Clock {
  protected nowDate: Date;
  protected clockInterval;

  constructor(protected speed = 1) {
    this.nowDate = new Date();
    this.clockInterval = setInterval(() => {
      this.nowDate.setTime(this.nowDate.getTime() + 100 * this.speed);
    }, 100);
  }

  public setSpeed(speed: number) {
    this.speed = speed;
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
