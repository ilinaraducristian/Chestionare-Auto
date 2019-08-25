import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { categories } from "../classes/categories";

import { environment } from "../../environments/environment";

import { BackendResponse } from "../interfaces/backend-response";

import { Observable, throwError } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SessionService {
  public category: string;
  private jsonHeaders: HttpHeaders;

  constructor(private http: HttpClient) {
    this.jsonHeaders = new HttpHeaders({
      "Content-Type": "application/json"
    });
  }

  newSession(): Observable<BackendResponse> {
    if (!this.category) return throwError("Category not provided!");
    if (!categories.includes(this.category))
      return throwError("Wrong category!");
    return this.http.post<BackendResponse>(
      `${environment.backend}${this.category}`,
      null,
      {
        withCredentials: true
      }
    );
  }

  getSession(token: string): Observable<BackendResponse> {
    return this.http.get<BackendResponse>(`${environment.backend}${token}`);
  }

  sendSnswers(
    token: string,
    index: number,
    answers: string
  ): Observable<BackendResponse> {
    return this.http.put<BackendResponse>(
      `${environment.backend}${token}`,
      { id: index, answers },
      { headers: this.jsonHeaders }
    );
  }
}
