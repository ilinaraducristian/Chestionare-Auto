import { Component, OnInit } from "@angular/core";
import { SessionService } from "src/app/services/session.service";
import { Router } from "@angular/router";
import { categories } from "src/app/classes/categories";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  public _shown_categories: object;

  constructor(private router: Router, private session_service: SessionService) {
    categories.forEach(category => {
      this.shown_categories[category] = `Categoria ${category
        .substring(category.length - 1)
        .toUpperCase()}`;
    });
  }

  ngOnInit() {}

  new_session(index: number): void {
    this.session_service.category = this.shown_categories[1][index];
    this.router.navigate(["session"]);
  }

  set shown_categories(shown_categories: object) {
    this._shown_categories = shown_categories;
  }

  get shown_categories(): object {
    return this._shown_categories;
  }
}
