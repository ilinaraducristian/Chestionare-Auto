import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";
import { Session } from "src/app/interfaces/session";
import { filter, tap, map, catchError } from "rxjs/operators";
import { of, pipe, UnaryFunction, Observable, merge } from "rxjs";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit {
  public session: Session;
  private time_manager: NodeJS.Timer;
  private remaining_time: Date = new Date();
  private answers: boolean[] = [false, false, false];
  private chestionar_index: number = 0;
  private chestionare: IterableIterator<number>;
  public status: string;

  constructor(
    private router: Router,
    private session_service: SessionService
  ) {}

  ngOnInit() {
    if (this.session_service.get_category() == null) {
      let token = localStorage.getItem("token");
      if (token == null) return this.router.navigate([""]);
      // get existing session if token is valid

      merge(
        // error handler observable
        this.session_service.get_session(token).pipe(this.handle_error),
        // response handler observable
        this.session_service
          .get_session(token)
          .pipe(this.handle_get_session_response)
      ).subscribe();
    } else {
      // get new session
      merge(
        // error handler observable
        this.session_service.new_session().pipe(this.handle_error),
        // response handler observable
        this.session_service
          .new_session()
          .pipe(this.handle_new_session_response)
      ).subscribe();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.time_manager);
  }

  show_passed(): void {
    this.session = null;
    this.status = "passed";
    localStorage.removeItem("token");
  }

  show_failed(): void {
    this.session = null;
    this.status = "failed";
    localStorage.removeItem("token");
  }

  // starts timer
  start_timer(): void {
    this.time_manager = setInterval(_ => {
      this.remaining_time.setTime(this.remaining_time.getTime() - 1000);
      if (this.remaining_time.getTime() <= 0) {
        clearInterval(this.time_manager);
        if (this.session.correct_answers > 21) {
          this.show_passed();
        } else {
          this.show_failed();
        }
      }
    }, 1000);
  }

  // check if session is finished
  verify_session(): void {
    if (this.session.wrong_answers > 4) {
      this.show_failed();
      clearInterval(this.time_manager);
    } else if (this.session.wrong_answers + this.session.correct_answers > 25) {
      this.show_passed();
      clearInterval(this.time_manager);
    }
  }

  // generated a new chestionar from existing session
  *chestionar_generator(): IterableIterator<number> {
    while (this.session.chestionare.length > 0) {
      if (this.chestionar_index == this.session.chestionare.length - 1)
        this.chestionar_index = 0;
      else this.chestionar_index++;
      // console.log(this.chestionar_index);
      // console.log(this.chestionar_index);
      yield;
    }
  }

  // catch frontend and backend erorrs and redirect back to home page
  private handle_error: UnaryFunction<Observable<{}>, Observable<{}>> = pipe(
    filter(response => response.hasOwnProperty("error")),
    map(response => response["error"]),
    catchError(error => of(error)),
    tap(error => {
      console.log(error);
      localStorage.removeItem("token");
      this.router.navigate([""]);
    })
  );

  // get a new session from backend and display it
  private handle_new_session_response: UnaryFunction<
    Observable<{}>,
    Observable<{}>
  > = pipe(
    filter(response => response.hasOwnProperty("session")),
    tap(response => {
      this.session = response["session"];
      localStorage.setItem("token", response["token"]);
      this.remaining_time.setTime(1800000);
      this.start_timer();
      this.chestionare = this.chestionar_generator();
    })
  );

  // handle received session
  private handle_get_session_response: UnaryFunction<
    Observable<{}>,
    Observable<{}>
  > = pipe(
    filter(response => {
      return response.hasOwnProperty("status");
    }),
    tap(response => {
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
          clearInterval(this.time_manager);
          break;
        case "failed":
          this.show_failed();
          clearInterval(this.time_manager);
          break;
        default:
          this.session = response["session"];
          this.remaining_time.setTime(
            Date.parse(this.session.created_at) +
              1800000 -
              Date.parse(response["now"])
          );
          this.start_timer();
          this.chestionare = this.chestionar_generator();
      }
    })
  );

  /* TEMPLATE FUNCTIONS */

  // select answers
  select_answer(i: number): boolean {
    this.answers[i] = !this.answers[i];
    return false;
  }

  // send answers to backend
  send_answer(): void {
    // convert answers from boolean to string
    let answers =
      (this.answers[0] ? "A" : "") +
      (this.answers[1] ? "B" : "") +
      (this.answers[2] ? "C" : "");

    // remove answered chestionar
    this.session.chestionare.splice(this.chestionar_index, 1);

    // reset answers
    this.answers = [false, false, false];

    // post requet from service

    merge(
      // error handler observable
      this.session_service
        .send_answers(
          localStorage.getItem("token"),
          this.chestionar_index,
          answers
        )
        .pipe(this.handle_error),
      // response handler observable
      this.session_service
        .send_answers(
          localStorage.getItem("token"),
          this.chestionar_index,
          answers
        )
        .pipe(this.handle_get_session_response)
    ).subscribe();
  }

  // show next chestionar
  next_chestionar(): void {
    this.chestionare.next();
    this.answers = [false, false, false];
  }
}
