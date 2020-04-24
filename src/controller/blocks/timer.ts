import { mergeElementStyle } from "../utils";

export class Timer {
  dom!: HTMLElement;

  constructor() {
    let timer = document.createElement("span");

    mergeElementStyle(timer, { marginRight: "14px" });

    this.dom = timer;

    this.render();
  }

  render(currentTime = 0, duration = 0): void {
    this.dom.innerText = `${formatTime(currentTime)} / ${formatTime(duration)}`;
  }
}

function formatTime(second: number): string {
  let mins = Math.floor(second / 60);
  let secs = second % 60;

  return `${mins < 10 ? `0${mins}` : mins}:${secs < 10 ? `0${secs}` : secs}`;
}
