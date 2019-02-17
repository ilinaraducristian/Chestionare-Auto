import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Session } from "../interfaces/session";

@Injectable({
  providedIn: "root"
})
export class SessionService {
  private category: String;
  private headers: HttpHeaders;

  constructor(private router: Router, private http: HttpClient) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
  }

  new_session(): Observable<Object> {
    return this.http.post<Session>(
      environment.backend + "new_session",
      { category: this.category },
      { headers: this.headers }
    );
  }

  get_session(token: String): Observable<Object> {
    return this.http.post<Session>(
      environment.backend + "get_session",
      { token },
      { headers: this.headers }
    );
  }

  set_category(category: String) {
    this.category = category;
  }

  get_category(): String {
    return this.category;
  }
}
