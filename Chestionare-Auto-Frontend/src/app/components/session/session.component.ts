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
  private answers: Array<boolean> = [false, false, false];
  private chestionare: any;
  private current_chestionar: Chestionar = {
    question: "",
    answers: [""],
    image: ""
  };
  private chestionar_index: number = 0;

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
        .subscribe(this.parse_response, this.parse_error);
    } else {
      // new session
      this.session_service
        .new_session()
        .subscribe(this.parse_response, this.parse_error);
    }
  }

  select_answer(i: number) {
    this.answers[i] = !this.answers[i];
    return false;
  }

  send_answer() {
    this.session_service
      .send_answers(
        localStorage.getItem("token"),
        this.chestionar_index,
        this.current_chestionar.answers
      )
      .subscribe(
        response => {
          if (response["status"] == "passed") {
            console.log("afiseaza passed");
          } else if (response["status"] == "failed") {
            console.log("afiseaza passed");
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
    this.current_chestionar = this.chestionare.next().value.chestionar;
    this.answers = [false, false, false];
  }

  *chestionar_generator() {
    while (this.session.chestionare.length > 0) {
      if (this.chestionar_index == this.session.chestionare.length)
        this.chestionar_index = 0;
      this.chestionar_index = this.chestionar_index;
      yield this.session.chestionare[this.chestionar_index++];
    }
  }

  parse_response(response) {
    if (response["error_message"]) {
      localStorage.removeItem("token");
      return this.router.navigate([""]);
    }

    if (response["token"]) localStorage.setItem("token", response["token"]);

    let session = response["session"];

    if (session.now) {
      this.remaining_time.setTime(
        Date.parse(session.created_at) + 1800000 - Date.parse(session.now)
      );
    } else {
      console.log(this.remaining_time);

      this.remaining_time.setTime(Date.parse(session.created_at) + 1800000);
    }

    this.session = session;
    this.time_manager = setInterval(() => {
      this.remaining_time.setTime(this.remaining_time.getTime() - 1000);
      if (this.remaining_time.getTime() - 1000 <= 0)
        clearInterval(this.time_manager);
    }, 1000);
  }

  parse_error() {
    localStorage.removeItem("token");
    this.router.navigate([""]);
  }
}
