import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";
import { Session } from "src/app/interfaces/session";
import { tap, catchError } from "rxjs/operators";
import { of } from "rxjs";
import Timer from "tiny-timer";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit {
  public session: Session;
  private time_manager;
  private remaining_time: number;
  private answers: boolean[];
  private chestionar_index: number = 0;
  private chestionare: IterableIterator<number>;
  public status: string;
  private timer: Timer;

  constructor(private router: Router, private session_service: SessionService) {
    this.timer = new Timer();
    this.answers = [false, false, false];
    this.timer.on("tick", ms => (this.remaining_time = ms / 1000));
    this.timer.on("done", () => {
      if (this.session.correct_answers >= 22) return this.show_passed();
      this.show_failed();
    });
  }

  ngOnInit() {
    if (this.session_service.get_category() === null) {
      let token = localStorage.getItem("token");
      if (token === null) return this.router.navigate([""]);
      this.session_service
        .get_session(token)
        .pipe(
          this.handle_get_session_response,
          catchError(error =>
            of(() => {
              localStorage.removeItem("token");
              this.router.navigate([""]);
            })
          )
        )
        .subscribe();
    } else {
      this.session_service
        .new_session()
        .pipe(
          this.handle_new_session_response,
          catchError(error =>
            of(() => {
              this.session_service.set_category(null);
              this.router.navigate([""]);
            })
          )
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    this.timer.stop();
  }

  show_passed(): void {
    this.session = null;
    localStorage.removeItem("token");
    this.status = "passed";
  }

  show_failed(): void {
    this.session = null;
    localStorage.removeItem("token");
    this.status = "failed";
  }

  // check if session is finished
  verify_session(): void {
    if (this.session.wrong_answers > 4) {
      this.show_failed();
      this.timer.stop();
    } else if (this.session.wrong_answers + this.session.correct_answers > 25) {
      this.show_passed();
      this.timer.stop();
    }
  }

  // generated a new chestionar from existing session
  *chestionar_generator(): IterableIterator<number> {
    while (this.session.chestionare.length > 0) {
      if (this.chestionar_index == this.session.chestionare.length - 1)
        this.chestionar_index = 0;
      else this.chestionar_index++;
      yield;
    }
  }

  // get a new session from backend and display it
  private handle_new_session_response = tap(response => {
    this.session = response["session"];
    localStorage.setItem("token", response["token"]);
    this.remaining_time = 1800;
    this.timer.start(this.remaining_time);
    this.chestionare = this.chestionar_generator();
  });

  // handle received session
  private handle_get_session_response = tap(response => {
    this.session = response["session"];
    this.remaining_time =
      Date.parse(this.session.created_at) +
      1800000 -
      Date.parse(response["now"]);
    this.timer.start(this.remaining_time);
    this.chestionare = this.chestionar_generator();
  });

  private handle_submit_answers_response = tap(response => {
    switch (response["status"]) {
      case "correct":
        this.session.correct_answers++;
        this.verify_session();
        break;
      case "wrong":
        this.session.wrong_answers++;
        this.verify_session();
        break;
      case "passed":
        this.show_passed();
        this.timer.stop();
        break;
      case "failed":
        this.show_failed();
        this.timer.stop();
        break;
      default:
    }
  });

  /* TEMPLATE FUNCTIONS */

  // select answers
  select_answer(i: number): boolean {
    this.answers[i] = !this.answers[i];
    return false;
  }

  // send answers to backend
  send_answer(): void {
    // convert answers from boolean to string
    let answers = `${this.answers[0] ? "A" : ""}${this.answers[1] ? "B" : ""}${
      this.answers[2] ? "C" : ""
    }`;

    // remove answered chestionar
    this.session.chestionare.splice(this.chestionar_index, 1);

    // reset answers
    this.answers = [false, false, false];

    // send answers to backend
    this.session_service
      .send_answers(
        localStorage.getItem("token"),
        this.chestionar_index,
        answers
      )
      .pipe(this.handle_submit_answers_response)
      .subscribe();
  }

  // show next chestionar
  next_chestionar(): void {
    this.chestionare.next();
    this.answers = [false, false, false];
  }
}
