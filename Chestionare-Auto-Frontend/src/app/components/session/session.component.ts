import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";
import { Session } from "src/app/interfaces/session";
import { Chestionar } from "src/app/interfaces/chestionar";

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

  ngOnInit() {
    if (this.session_service.get_category() == null) {
      // get session
      let token = localStorage.getItem("token");
      if (token == null) return this.router.navigate([""]);
      this.session_service
        .get_session(token)
        .subscribe(
          response => this.parse_response(response),
          error => this.parse_response(error)
        );
    } else {
      // new session
      this.session_service
        .new_session()
        .subscribe(
          response => this.parse_response(response),
          error => this.parse_response(error)
        );
    }
  }

  select_answer(i: number) {
    this.answers[i] = !this.answers[i];
    return false;
  }

  send_answer() {
    let answers =
      (this.answers[0] ? "A" : "") +
      (this.answers[1] ? "B" : "") +
      (this.answers[2] ? "C" : ""); // boolean to String

    this.session_service
      .send_answers(
        localStorage.getItem("token"),
        this.chestionar_index,
        answers
      )
      .subscribe(
        response => {
          console.log(response);

          if (response["status"] == "correct") {
            console.log("afiseaza correct");
            this.session.correct_answers++;
            this.session.chestionare.splice(this.chestionar_index, 1);
            this.chestionar_generator.next();
          } else if (response["status"] == "wrong") {
            console.log("afiseaza wrong");
            this.session.wrong_answers++;
            this.session.chestionare.splice(this.chestionar_index, 1);
            this.chestionar_generator.next();
          } else {
          }
        },
        error => {
          return this.router.navigate([""]);
        }
      );
    this.answers = [false, false, false];
  }

  next_chestionar() {
    this.chestionar_generator.next();
    this.answers = [false, false, false];
  }

  parse_response(response) {
    if (response["error_message"]) {
      localStorage.removeItem("token");
      return this.router.navigate([""]);
    }

    if (response["token"]) localStorage.setItem("token", response["token"]);

    this.chestionar_generator = (function*() {
      while (this.session.chestionare.length > 0) {
        if (this.chestionar_index == this.session.chestionare.length)
          this.chestionar_index = 0;
        else this.chestionar_index++;
      }
    })();

    let session = response["session"];

    if (session.now) {
      this.remaining_time.setTime(
        Date.parse(session.created_at) + 1800000 - Date.parse(session.now)
      );
    } else {
      this.remaining_time.setTime(Date.parse(session.created_at) + 1800000);
    }

    this.session = session;
    this.time_manager = setInterval(() => {
      this.remaining_time.setTime(this.remaining_time.getTime() - 1000);
      if (this.remaining_time.getTime() - 1000 <= 0)
        clearInterval(this.time_manager);
    }, 1000);
  }

  parse_error(error) {
    localStorage.removeItem("token");
    this.router.navigate([""]);
  }
}
