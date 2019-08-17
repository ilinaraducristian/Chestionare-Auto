import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { categories } from "src/app/classes/categories";

import { SessionService } from "src/app/services/session.service";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"]
})
export class HomeComponent implements OnInit {
  private _shown_categories: object;

  constructor(private router: Router, private session_service: SessionService) {
    this.shown_categories = {};
    categories.forEach(category => {
      this.shown_categories[category] = `Categoria ${category
        .substring(category.length - 1)
        .toUpperCase()}`;
    });
  }

  ngOnInit() {}

  new_session(key: string) {
    this.session_service.category = key;
    this.router.navigate(["session"]);
    return false;
  }

  set shown_categories(shown_categories: object) {
    this._shown_categories = shown_categories;
  }

  get shown_categories(): object {
    return this._shown_categories;
  }
}
