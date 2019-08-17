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
  private session: Session;
  @Input("now")
  private now: string;

  @Output("session_status")
  private session_status: EventEmitter<string>;

  private _remaining_time: number;
  private _answers: boolean[];
  private _chestionar: Chestionar;
  public Math = Math;

  private _timer: Timer;
  private _chestionar_index;
  private _token: string;
  private _chestionar_generator: IterableIterator<{
    item: Chestionar;
    index: number;
  }>;

  constructor(private session_service: SessionService) {
    this.timer = new Timer();
    this.chestionar_index = 0;
    this.answers = [false, false, false];
    this.token = localStorage.getItem("token");
    this.session_status = new EventEmitter<string>();
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
    this.remaining_time =
      Date.parse(this.session.created_at) / 1000 +
      1800 -
      Date.parse(this.now) / 1000;
    this.timer.onTick(time => {
      this.remaining_time = time;
    });
    this.timer.onDone(() => {
      if (this.session.correct_answers >= 22) {
        this.session_status.emit("passed");
      } else {
        this.session_status.emit("failed");
      }
    });
    this.timer.start(this.remaining_time);
    this.chestionar_generator = this.closed_loop_array_item_generator(
      this.session.chestionare
    );
    this.chestionar = this.session.chestionare[this.chestionar_index];
  }

  ngOnDestroy(): void {
    this.timer.stop();
  }

  *closed_loop_array_item_generator(array: any[]) {
    let index = 0;
    while (array.length > 0) {
      if (index == array.length - 1) index = 0;
      else index++;
      yield { item: array[index], index };
    }
  }

  select_answer(index: number) {
    this.answers[index] = !this.answers[index];
    return false;
  }

  send_answers() {
    let answers = `${this.answers[0] ? "A" : ""}${this.answers[1] ? "B" : ""}${
      this.answers[2] ? "C" : ""
    }`;
    this.session_service
      .send_answers(this.token, this.chestionar_index, answers)
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
                this.session_status.emit("passed");
                return;
              }
              break;
            case "wrong":
              this.session.wrong_answers++;
              if (this.session.wrong_answers >= 5) {
                this.session_status.emit("failed");
                return;
              }
              break;
            case "passed":
              this.session_status.emit("passed");
              return;
            case "failed":
              this.session_status.emit("failed");
              return;
          }
          this.session.chestionare.splice(this.chestionar_index, 1);
          this.chestionar = this.session.chestionare[this.chestionar_index];
          this.answers = [false, false, false];
        },
        error => {
          console.log(error);
        }
      );
    return false;
  }

  next_chestionar() {
    this.answers = [false, false, false];
    const { item, index } = this.chestionar_generator.next().value;
    this.chestionar = item;
    this.chestionar_index = index;
    return false;
  }

  set remaining_time(remaining_time: number) {
    this._remaining_time = remaining_time;
  }

  set answers(answers: boolean[]) {
    this._answers = answers;
  }

  set chestionar(chestionar: Chestionar) {
    this._chestionar = chestionar;
  }

  set timer(timer: Timer) {
    this._timer = timer;
  }

  set chestionar_index(chestionar_index: number) {
    this._chestionar_index = chestionar_index;
  }

  set token(token: string) {
    this._token = token;
  }

  set chestionar_generator(
    chestionar_generator: IterableIterator<{
      item: Chestionar;
      index: number;
    }>
  ) {
    this._chestionar_generator = chestionar_generator;
  }

  get remaining_time() {
    return this._remaining_time;
  }

  get answers() {
    return this._answers;
  }

  get chestionar() {
    return this._chestionar;
  }

  get timer() {
    return this._timer;
  }

  get chestionar_index() {
    return this._chestionar_index;
  }

  get token() {
    return this._token;
  }

  get chestionar_generator() {
    return this._chestionar_generator;
  }
}
