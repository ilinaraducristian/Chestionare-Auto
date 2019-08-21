import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

import { Timer } from "src/app/classes/timer";

import { Chestionar } from "src/app/interfaces/chestionar";
import { Session } from "src/app/interfaces/session";

import { SessionService } from "src/app/services/session.service";

@Component({
  selector: "app-chestionar",
  templateUrl: "./chestionar.component.html",
  styleUrls: ["./chestionar.component.css"]
})
export class ChestionarComponent implements OnInit {
  @Input("session")
  public session: Session;
  @Input("now")
  private now: string;

  @Output("sessionStatus")
  private sessionStatus: EventEmitter<string>;

  private remainingTime: { seconds: number; minutes: number };
  private answers: boolean[];
  public chestionar: Chestionar;
  public Math = Math;

  private timer: Timer;
  private chestionarIndex;
  private token: string;
  private chestionarGenerator: IterableIterator<{
    item: Chestionar;
    index: number;
  }>;

  constructor(private sessionService: SessionService) {
    this.timer = new Timer();
    this.chestionarIndex = 0;
    this.answers = [false, false, false];
    this.token = localStorage.getItem("token");
    this.sessionStatus = new EventEmitter<string>();
    this.remainingTime = { minutes: 0, seconds: 0 };
    this.session = {
      created_at: "",
      chestionare: [],
      correct_answers: 0,
      wrong_answers: 0
    };
    this.chestionar = {
      answers: [],
      question: "",
      image: "",
      correct_answers: ""
    };
  }

  ngOnInit() {
    let calculatedTime =
      Date.parse(this.session.created_at) + 1800000 - Date.parse(this.now);

    this.remainingTime.minutes = Math.floor(calculatedTime / 1000 / 60);
    this.remainingTime.seconds = Math.floor((calculatedTime / 1000) % 60);

    this.timer.on("tick", time => {
      this.remainingTime.minutes = Math.floor(time / 1000 / 60);
      this.remainingTime.seconds = Math.floor((time / 1000) % 60);
    });

    this.timer.on("done", () => {
      if (this.session.correct_answers >= 22) {
        this.sessionStatus.emit("passed");
      } else {
        this.sessionStatus.emit("failed");
      }
    });
    this.timer.start(calculatedTime);
    this.chestionarGenerator = this.closedLoopArrayItemGenerator(
      this.session.chestionare
    );
    this.chestionar = this.session.chestionare[this.chestionarIndex];
  }

  ngOnDestroy(): void {
    this.timer.stop();
  }

  *closedLoopArrayItemGenerator(array: any[]) {
    let index = 0;
    while (array.length > 0) {
      if (index == array.length - 1) index = 0;
      else index++;
      yield { item: array[index], index };
    }
  }

  selectAnswer(index: number) {
    this.answers[index] = !this.answers[index];
    return false;
  }

  sendAnswers() {
    let answers = `${this.answers[0] ? "A" : ""}${this.answers[1] ? "B" : ""}${
      this.answers[2] ? "C" : ""
    }`;
    this.sessionService
      .sendSnswers(this.token, this.chestionarIndex, answers)
      .subscribe(
        response => {
          if (response.error) {
            console.log(response.error);
            return;
          }
          switch (response.status) {
            case "correct":
              this.session.correct_answers++;

              if (this.session.chestionare.length == 1) {
                this.sessionStatus.emit("passed");
                return;
              }
              break;
            case "wrong":
              this.session.wrong_answers++;
              if (this.session.wrong_answers >= 5) {
                this.sessionStatus.emit("failed");
                return;
              }
              break;
            case "passed":
              this.sessionStatus.emit("passed");
              return;
            case "failed":
              this.sessionStatus.emit("failed");
              return;
          }
          this.session.chestionare.splice(this.chestionarIndex, 1);
          this.chestionar = this.session.chestionare[this.chestionarIndex];
          this.answers = [false, false, false];
        },
        error => {
          console.log(error);
        }
      );
    return false;
  }

  nextChestionar() {
    this.answers = [false, false, false];
    const { item, index } = this.chestionarGenerator.next().value;
    this.chestionar = item;
    this.chestionarIndex = index;
    return false;
  }
}
