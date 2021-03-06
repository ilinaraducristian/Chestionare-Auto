import { Session } from "./session";

export interface BackendResponse {
  status?: string;
  error?: string;
  session?: Session;
  now?: string;
  token?: string;
}
