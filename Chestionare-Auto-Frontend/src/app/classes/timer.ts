import { interval, Subscription, Observable } from "rxjs";
import { tap, take, map } from "rxjs/operators";

export class Timer {
  private time: number;
  private tickTime: number;
  private timer_handle: Observable<number>;
  private timer_subscription: Subscription;
  private tick: (time: number) => void;
  private done: () => void;

  constructor(tickTime?: number) {
    if (tickTime) {
      this.tickTime = tickTime;
    } else {
      this.tickTime = 1000;
    }
    this.tick = time => {};
    this.done = () => {};
  }

  /**
   * Start the timer
   * @param time Time in seconds.
   */
  start(time: number) {
    this.time = time;
    this.stop();
    this.timer_handle = interval(this.tickTime).pipe(
      take(time),
      map(elapsed_seconds => this.time - elapsed_seconds - 1),
      tap(time => this.tick(time))
    );
    this.timer_subscription = this.timer_handle.subscribe(
      value => {},
      error => {},
      () => this.done()
    );
  }

  onTick(tick: (time: number) => void) {
    this.tick = tick;
  }

  onDone(done: () => void) {
    this.done = done;
  }

  stop() {
    if (this.timer_subscription) this.timer_subscription.unsubscribe();
  }
}
