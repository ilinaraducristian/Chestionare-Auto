import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";
import { Session } from "src/app/interfaces/session";
import { log } from "util";
import { Question } from "src/app/interfaces/question";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit {
  private session: Session;
  private time_manager: any; // NodeJS.Timer
  private remaining_time: Date = new Date(1800000);
  private answers: Array<boolean> = [false, false, false];
  private q: any;
  private question: Question = { question: "", answers: [""], image: "" };
  private index: Number = 0;

  constructor(
    private router: Router,
    private session_service: SessionService
  ) {}

  select_answer(i: number) {
    this.answers[i] = !this.answers[i];
    return false;
  }

  next_question() {
    this.index = this.q.next().value;
    let question = this.q.next().value;
    this.question.question = question.question;
    this.question.answers = question.answers;
    this.question.image = question.image;
  }

  send_answer() {
    this.session_service
      .send_answers(
        localStorage.getItem("token"),
        this.index,
        this.question.answers
      )
      .subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.log(error);
        }
      );
  }

  set_session(session: Session) {
    this.session = session;
    this.q = this.questions_generator(session.questions);
    // console.log(this.q.next());
    // expiration_date = created_at + 30 minutes
    // remaining_time = expiration_date - now
    if (session.now.toString() === "Invalid Date") {
      this.remaining_time.setTime(session.created_at.getTime() + 1800000);
    } else {
      this.remaining_time.setTime(
        session.created_at.getTime() + 1800000 - session.now.getTime()
      );
    }
    this.next_question();
    this.time_manager = setInterval(() => {
      this.remaining_time.setTime(this.remaining_time.getTime() - 1000);
      if (this.remaining_time.getTime() - 1000 <= 0)
        clearInterval(this.time_manager);
    }, 1000);
  }

  *questions_generator(questions: [Question]) {
    let i = 0;
    while (questions.length > 0) {
      if (i >= questions.length) i = 0;
      yield i;
      yield questions[i++];
    }
  }

  ngOnInit() {
    // get session
    if (this.session_service.get_category() == null) {
      let token = localStorage.getItem("token");
      if (token == null) {
        this.router.navigate([""]);
        return;
      }
      this.session_service.get_session(token).subscribe(
        response => {
          let session = response["session"];
          session.now = new Date(session.now);
          session.created_at = new Date(session.created_at);
          this.set_session(session);
        },
        error => {
          localStorage.removeItem("token");
          this.router.navigate([""]);
        }
      );
      // new session
    } else {
      console.log("new_session");
      this.session_service.new_session().subscribe(
        response => {
          let session = response["session"];
          console.log("session");
          session.now = new Date(session.now);
          session.created_at = new Date(session.created_at);
          this.set_session(session);
          localStorage.setItem("token", response["token"]);
        },
        error => {
          console.log("error");
          this.router.navigate([""]);
        }
      );
    }
  }
}
