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
  private time_manager: NodeJS.Timer;
  private remaining_time: Date;
  private answers: Array<boolean> = [false, false, false];

  constructor(
    private router: Router,
    private session_service: SessionService
  ) {}

  select_answer(i: number) {
    this.answers[i] = !this.answers[i];
    return false;
  }

  set_session(session: Session) {
    this.session = session;
    // expiration_date = created_at + 30 minutes
    // remaining_time = expiration_date - now
    console.log(session.created_at);
    console.log(session.now);
    console.log(
      Date.parse(session.created_at) + 1800000 - Date.parse(session.now)
    );
    this.remaining_time = new Date(
      Date.parse(session.created_at) + 1800000 - Date.parse(session.now)
    );

    this.time_manager = setInterval(() => {
      this.remaining_time.setTime(this.remaining_time.getTime() - 1000);
      if (this.remaining_time.getTime() - 1000 <= 0)
        clearInterval(this.time_manager);
    }, 1000);
  }

  ngOnInit() {
    if (this.session_service.get_category() == null) {
      let token = localStorage.getItem("token");
      if (token == null) {
        this.router.navigate([""]);
        return;
      }
      this.session_service.get_session(token).subscribe(
        response => {
          this.set_session(response["session"]);
        },
        error => {
          localStorage.removeItem("token");
          this.router.navigate([""]);
        }
      );
    } else {
      this.session_service.new_session().subscribe(
        response => {
          this.set_session(response["session"]);
          localStorage.setItem("token", response["token"]);
        },
        error => {
          this.router.navigate([""]);
        }
      );
    }
  }
}
