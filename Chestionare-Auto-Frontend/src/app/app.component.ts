import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  public route: string = "";

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(navigation => {
        switch (navigation["url"]) {
          case "/":
            this.route = "home";
            break;
          case "/session":
            this.route = "session";
            break;
          default:
            this.route = "";
        }
      });
  }

  goto(location: string) {
    this.router.navigate([location]);
    return false;
  }
}
