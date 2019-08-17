import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";

import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";
import { ChestionarComponent } from "./components/chestionar/chestionar.component";
import { HomeComponent } from "./components/home/home.component";
import { SessionComponent } from "./components/session/session.component";

@NgModule({
  declarations: [
    AppComponent,
    ChestionarComponent,
    HomeComponent,
    SessionComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
