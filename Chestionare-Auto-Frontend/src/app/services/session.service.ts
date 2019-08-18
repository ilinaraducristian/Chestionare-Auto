import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { categories } from "../classes/categories";

import { environment } from "../../environments/environment";

import { BackendResponse } from "../interfaces/backend_response";

import { Observable, throwError } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SessionService {
  public category: string;
  private json_headers: HttpHeaders;

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
}
