import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { Session } from "../interfaces/session";
import { ReturnObject } from "../interfaces/return-object";

@Injectable({
  providedIn: "root"
})
export class SessionService {
  private category: String;
  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
  }

  new_session(): Observable<ReturnObject> {
    return this.http.post<ReturnObject>(
      environment.backend + "new_session",
      { category: this.category },
      { headers: this.headers }
    );
  }

  get_session(token: String): Observable<object> {
    return this.http.post(
      environment.backend + "get_session",
      { token },
      { headers: this.headers }
    );
  }

  send_answers(
    token: string,
    index: number,
    answers: string
  ): Observable<object> {
    return this.http.post(
      environment.backend + "submit_answer",
      { token, chestionar_index: index, answers },
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
