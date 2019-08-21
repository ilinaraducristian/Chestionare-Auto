import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { environment } from "../../../environments/environment";

import { Session } from "../../interfaces/session";

import { SessionService } from "../../services/session.service";

@Component({
  selector: "app-session",
  templateUrl: "./session.component.html",
  styleUrls: ["./session.component.css"]
})
export class SessionComponent implements OnInit {
  private _session: Session;
  public now: string;
  public status: string;

  constructor(private router: Router, private sessionService: SessionService) {
    this.status = "loading";
  }

  ngOnInit() {
    if (this.sessionService.category == null) {
      let token = localStorage.getItem("token");
      if (token == null) return this.router.navigate([""]);
      this.sessionService.getSession(token).subscribe(
        response => {
          if (response.status) {
            if (response.status == "passed") {
              this.showPassed();
            } else if (response.status == "failed") {
              this.showFailed();
            }
            return;
          }
          this.session = response["session"];
          this.now = response["now"];
          this.status = "working";
        },
        error => {
          localStorage.removeItem("token");
          this.router.navigate([""]);
        }
      );
    } else {
      this.sessionService.newSession().subscribe(
        response => {
          localStorage.setItem("token", response["token"]);
          this.sessionService.category = null;
          this.session = response["session"];
          this.now = response["now"];
          this.status = "working";
        },
        error => {
          localStorage.removeItem("token");
          this.router.navigate([""]);
        }
      );
    }
  }

  sessionStatus(event: string) {
    if (event == "passed") {
      this.showPassed();
    } else {
      this.showFailed();
    }
  }

  showPassed(): void {
    this.session = null;
    localStorage.removeItem("token");
    this.status = "passed";
  }

  showFailed(): void {
    this.session = null;
    localStorage.removeItem("token");
    this.status = "failed";
  }

  set session(session: Session) {
    if (session != null) {
      session.chestionare.map(chestionar => {
        if (!chestionar.image) return;
        if (environment.cdn) {
          chestionar.image = `${environment.cdn}${chestionar.image}`;
        } else {
          chestionar.image = `assets/${chestionar.image}`;
        }
        return chestionar;
      });
    }
    this._session = session;
  }

  get session() {
    return this._session;
  }
}
