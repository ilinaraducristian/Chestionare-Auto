import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";
import { Category } from "src/app/interfaces/category";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  public categories: Array<string> = [
    "Categoria A",
    "Categoria B",
    "Categoria C",
    "Categoria D"
  ];

  constructor(
    private router: Router,
    private session_service: SessionService
  ) {}

  ngOnInit() {}

  new_session(category: string) {
    this.session_service.set_category(category.toLowerCase().replace(" ", "_"));
    this.router.navigate(["session"]);
  }
}
