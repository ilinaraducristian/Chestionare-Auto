import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { RouterModule, Routes } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { HomeComponent } from "./components/home/home.component";
import { SessionComponent } from "./components/session/session.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";
import { ChestionarComponent } from './components/chestionar/chestionar.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "session", component: SessionComponent }
];

@NgModule({
  declarations: [AppComponent, HomeComponent, SessionComponent, ChestionarComponent],
  imports: [
    RouterModule.forRoot(routes),
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
