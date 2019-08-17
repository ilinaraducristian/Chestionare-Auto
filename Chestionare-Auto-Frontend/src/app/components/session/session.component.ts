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
  private _now: string;
  private _status: string;

  constructor(private router: Router, private session_service: SessionService) {
    this.status = "loading";
  }

  ngOnInit() {
    if (this.session_service.category == null) {
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
      this.session_service.new_session().subscribe(
        response => {
          localStorage.setItem("token", response["token"]);
          this.session_service.category = null;
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

  get session(): Session {
    return this._session;
  }

  set now(now: string) {
    this._now = now;
  }

  get now(): string {
    return this._now;
  }

  set status(status: string) {
    this._status = status;
  }

  get status(): string {
    return this._status;
  }
}
