import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./components/home/home.component";
import { SessionComponent } from "./components/session/session.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "session", component: SessionComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
