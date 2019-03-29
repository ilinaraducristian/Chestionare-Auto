import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";
import { Session } from "src/app/interfaces/session";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit {
  private session: Session;
  private time_manager: any; // NodeJS.Timer
  private remaining_time: Date = new Date();
  private answers: [boolean, boolean, boolean] = [false, false, false];
  private chestionar_index: number = 0;
  private chestionar_generator: any;

  constructor(
    private router: Router,
    private session_service: SessionService
  ) {}

  /**
   * call clearInterval() to stop the timer
   */
  startTimer() {
    this.time_manager = setInterval(_ => {
      this.remaining_time.setTime(this.remaining_time.getTime() - 1000);
      if (this.remaining_time.getTime() - 1000 <= 0) {
        clearInterval(this.time_manager);
        this.verify_session_and_close();
      }
    }, 1000);
  }

  verify_session_and_close() {
    if (this.session.correct_answers > 21) {
      console.log("passed");
      clearInterval(this.time_manager);
    } else {
      console.log("failed");
      clearInterval(this.time_manager);
    }
  }

  verify_session() {
    if (this.session.wrong_answers > 4) {
      console.log("failed");
      clearInterval(this.time_manager);
    } else if (this.session.wrong_answers + this.session.correct_answers > 25) {
      console.log("passed");
      clearInterval(this.time_manager);
    }
  }

  *generator() {
    while (this.session.chestionare.length > 0) {
      if (this.chestionar_index == this.session.chestionare.length)
        this.chestionar_index = 0;
      else this.chestionar_index++;
      yield;
    }
  }

  ngOnDestroy() {
    clearInterval(this.time_manager);
  }

  ngOnInit() {
    if (this.session_service.get_category() == null) {
      // get session
      let token = localStorage.getItem("token");
      if (token == null) return this.router.navigate([""]);
      this.session_service.get_session(token).subscribe(
        response => {
          if (response["error"]) {
            console.log(response["error"]);
            return;
          }
          if (response["status"]) {
            switch (response["status"]) {
              case "passed":
                console.log("passed");
                clearInterval(this.time_manager);
                break;
              case "failed":
                console.log("failed");
                clearInterval(this.time_manager);
                break;
              default:
                this.session = response["session"];
                this.remaining_time.setTime(
                  response["now"] - Date.parse(this.session.created_at)
                );
                this.startTimer();
                this.chestionar_generator = this.generator();
            }
          }
        },
        error => this.parse_error(error)
      );
    } else {
      // new session
      this.session_service.new_session().subscribe(
        response => {
          if (response["error"]) {
            console.log(response["error"]);
            return;
          }
          if (response["session"]) {
            this.session = response["session"];
            localStorage.setItem("token", response["token"]);
            this.remaining_time.setTime(1800000);
            this.startTimer();
            this.chestionar_generator = this.generator();
          }
        },
        error => this.parse_error(error)
      );
    }
  }

  select_answer(i: number): boolean {
    this.answers[i] = !this.answers[i];
    return false;
  }

  send_answer() {
    // boolean to String
    let answers =
      (this.answers[0] ? "A" : "") +
      (this.answers[1] ? "B" : "") +
      (this.answers[2] ? "C" : "");

    // remove answered chestionar
    this.session.chestionare.splice(this.chestionar_index, 1);

    this.session_service
      .send_answers(
        localStorage.getItem("token"),
        this.chestionar_index,
        answers
      )
      .subscribe(
        response => {
          if (response["error"]) {
            console.log(response["status"]);
            return;
          }
          switch (response["status"]) {
            case "correct":
              this.session.correct_answers++;
              this.next_chestionar();
              this.verify_session();
              break;
            case "wrong":
              this.session.wrong_answers++;
              this.next_chestionar();
              this.verify_session();
              break;
            case "passed":
              console.log("passed");
              clearInterval(this.time_manager);
              break;
            case "failed":
              console.log("failed");
              clearInterval(this.time_manager);
              break;
          }
        },
        error => this.parse_error(error)
      );
  }

  next_chestionar() {
    this.chestionar_generator.next();
    this.answers = [false, false, false];
  }

  parse_error(error) {
    console.log(error);
    localStorage.removeItem("token");
    this.router.navigate([""]);
  }
}
