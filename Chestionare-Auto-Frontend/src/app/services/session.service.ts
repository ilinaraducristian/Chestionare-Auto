import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { BackendResponse } from "../interfaces/backend_response";

@Injectable({
  providedIn: "root"
})
export class SessionService {
  private category: string;
  private jsonHeaders: HttpHeaders;

  constructor(private http: HttpClient) {
    this.jsonHeaders = new HttpHeaders({
      "Content-Type": "application/json"
    });
  }

  new_session(): Observable<BackendResponse> {
    return this.http.post<BackendResponse>(
      `${environment.backend}/${this.category}`,
      null
    );
  }

  get_session(token: string): Observable<BackendResponse> {
    return this.http.get<BackendResponse>(`${environment.backend}/${token}`);
  }

  send_answers(
    token: string,
    index: number,
    answers: string
  ): Observable<BackendResponse> {
    return this.http.put<BackendResponse>(
      `${environment.backend}/${token}`,
      { id: index, answers },
      { headers: this.jsonHeaders }
    );
  }

  set_category(category: string) {
    this.category = category;
  }

  get_category(): string {
    return this.category;
  }
}
