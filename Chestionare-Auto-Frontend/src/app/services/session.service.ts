import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { BackendResponse } from "../interfaces/backend_response";
import { categories } from "../classes/categories";

@Injectable({
  providedIn: "root"
})
export class SessionService {
  private _category: string;
  private _json_headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.json_headers = new HttpHeaders({
      "Content-Type": "application/json"
    });
  }

  new_session(): Observable<BackendResponse> {
    if (!this.category) return throwError("Category not provided!");
    if (!categories.includes(this.category))
      return throwError("Wrong category!");
    return this.http.post<BackendResponse>(
      `${environment.backend}${this.category}`,
      null
    );
  }

  get_session(token: string): Observable<BackendResponse> {
    return this.http.get<BackendResponse>(`${environment.backend}${token}`);
  }

  send_answers(
    token: string,
    index: number,
    answers: string
  ): Observable<BackendResponse> {
    return this.http.put<BackendResponse>(
      `${environment.backend}${token}`,
      { id: index, answers },
      { headers: this.json_headers }
    );
  }

  set category(category: string) {
    this._category = category;
  }

  get category(): string {
    return this._category;
  }

  set json_headers(json_headers: HttpHeaders) {
    this._json_headers = json_headers;
  }

  get json_headers(): HttpHeaders {
    return this._json_headers;
  }
}
