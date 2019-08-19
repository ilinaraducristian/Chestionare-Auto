enum Status {
  ticking,
  paused,
  stopped
}

export class Timer {
  private time: number;
  private tickTime: number;
  private status: Status;
  private timer_handler: any;
  private tick: (time: number) => void;
  private done: () => void;

  constructor(tickTime?: number) {
    if (tickTime) {
      this.tickTime = tickTime;
    } else {
      this.tickTime = 1000;
    }
    this.status = Status.stopped;
  }

  start(time: number) {
    if (this.status == Status.ticking || this.status == Status.paused) return;
    this.time = time;
    this.status = Status.ticking;
    this.timer_handler = setInterval(() => {
      if (this.time <= 0) {
        this.done();
        this.stop();
      } else {
        this.time -= this.tickTime;
        this.tick(this.time);
      }
    }, this.tickTime);
  }

  setTicktime(tickTime: number) {
    if (this.status == Status.ticking || this.status == Status.paused) return;
    this.tickTime = tickTime;
  }

  pause() {
    if (this.status == Status.stopped || this.status == Status.paused) return;
    clearInterval(this.timer_handler);
    this.status = Status.paused;
  }

  resume() {
    if (this.status == Status.ticking || this.status == Status.stopped) return;
    this.timer_handler = setInterval(() => {
      if (this.time <= 0) {
        this.done();
        this.stop();
      } else {
        this.time -= this.tickTime;
        this.tick(this.time);
      }
    }, this.tickTime);
    this.status = Status.ticking;
  }

  on(event: string, callback: (time?: number) => void) {
    if (this.status == Status.ticking || this.status == Status.paused) return;
    switch (event) {
      case "tick":
        this.tick = callback;
        break;
      case "done":
        this.done = callback;
        break;
    }
  }

  stop() {
    if (this.status == Status.stopped) return;
    clearInterval(this.timer_handler);
    this.status = Status.stopped;
  }
}
