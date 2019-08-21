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
  public shownCategories: object;

  constructor(private router: Router, private sessionService: SessionService) {
    this.shownCategories = {};
    categories.forEach(category => {
      this.shownCategories[category] = `Categoria ${category
        .substring(category.length - 1)
        .toUpperCase()}`;
    });
  }

  ngOnInit() {}

  newSession(key: string) {
    this.sessionService.category = key;
    this.router.navigate(["session"]);
    return false;
  }
}
