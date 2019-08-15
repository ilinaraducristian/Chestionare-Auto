import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";
import { Session } from "src/app/interfaces/session";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit {
  public session: Session;
  public status: string;

  constructor(private router: Router, private session_service: SessionService) {
    this.status = "loading";
  }

  ngOnInit() {
    if (this.session_service.get_category() == null) {
      let token = localStorage.getItem("token");
      if (token == null) return this.router.navigate([""]);
      this.session_service.get_session(token).subscribe(
        response => {
          if (response.status) {
            if (response.status == "passed") {
              this.show_passed();
            } else if (response.status == "failed") {
              this.show_failed();
            }
            return;
          }
          this.set_session(response["session"]);
          this.status = "working";
        },
        error => {
          localStorage.removeItem("token");
          this.router.navigate([""]);
        }
      );
    } else {
      this.session_service.new_session().subscribe(
        response => {
          localStorage.setItem("token", response["token"]);
          this.set_session(response["session"]);
          this.status = "working";
        },
        error => {
          localStorage.removeItem("token");
          this.router.navigate([""]);
        }
      );
    }
  }

  set_session(session: Session) {
    session.chestionare.map(chestionar => {
      if (!chestionar.image) return;
      if (environment.cdn) {
        chestionar.image = `${environment.cdn}${chestionar.image}`;
      } else {
        chestionar.image = `assets/${chestionar.image}`;
      }
      return chestionar;
    });
    this.session = session;
  }

  session_status(event: string) {
    if (event == "passed") {
      this.show_passed();
    } else {
      this.show_failed();
    }
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
}
