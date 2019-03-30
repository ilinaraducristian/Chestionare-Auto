import { Session } from "./session";

export interface ReturnObject {
  status: string;
  error: string;
  session: Session;
  token: string;
}
