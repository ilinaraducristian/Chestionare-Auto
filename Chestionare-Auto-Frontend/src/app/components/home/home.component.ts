import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  public categories: string[][] = [
    ["Categoria A", "Categoria B", "Categoria C", "Categoria D"],
    ["category_a", "category_b", "category_c", "category_d"]
  ];

  constructor(
    private router: Router,
    private session_service: SessionService
  ) {}

  ngOnInit() {}

  new_session(index: number): void {
    this.session_service.set_category(this.categories[1][index]);
    this.router.navigate(["session"]);
  }
}
