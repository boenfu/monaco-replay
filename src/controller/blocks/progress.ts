import { mergeElementStyle } from "../utils";
import { PRIMARY_COLOR } from "../theme";
import { Player } from "../../player";

const REMAIN_PLAY_TIMEOUT = 600;

export class Progress {
  private progressLine!: HTMLElement;

  private cursor!: ProgressCursor;

  dom!: HTMLElement;

  get playing(): boolean {
    return this.player.playing;
  }

  constructor(private player: Player) {
    let wrapper = document.createElement("section");

    mergeElementStyle(wrapper, {
      flex: "1",
      maxWidth: "600px",
      display: "flex",
      alignItems: "center",
      backgroundColor: "#fff",
      height: "4px",
      borderRadius: "8px",
      margin: "0 16px",
      borderColor: PRIMARY_COLOR,
      borderStyle: "solid",
      borderTopWidth: "4px",
      borderBottomWidth: "4px",
    });

    wrapper.addEventListener("mousedown", this.onWrapperMouseDown, true);

    this.dom = wrapper;

    this.initializeLine();
    this.initializeCursor();
  }

  render(progress: number): void {
    mergeElementStyle(this.progressLine, {
      width: `${progress * 100}%`,
    });
  }

  play(): void {
    this.player.play();
  }

  pause(): void {
    this.player.pause();
  }

  updateProgress(progress: number): void {
    if (this.playing) {
      this.player.pause();
    }

    this.player.progress = progress;
  }

  private onWrapperMouseDown = (event: MouseEvent): void => {
    this.cursor.onMouseDown(event);
  };

  private initializeCursor(): void {
    this.cursor = new ProgressCursor(this);
    this.dom.appendChild(this.cursor.dom);
  }

  private initializeLine(): void {
    let progressLine = document.createElement("div");

    mergeElementStyle(progressLine, {
      backgroundColor: "#3978ff",
      width: "0",
      height: "100%",
      borderBottomLeftRadius: "2px",
      borderTopLeftRadius: "2px",
    });

    this.dom.appendChild(progressLine);

    this.progressLine = progressLine;
  }
}

class ProgressCursor {
  private moving = false;
  private pausedBeforeUpdate = false;

  dom: HTMLElement;

  constructor(private progress: Progress) {
    let cursor = document.createElement("i");

    mergeElementStyle(cursor, {
      width: "4px",
      height: "16px",
      borderRadius: "2px",
      background: "#3978ff",
      cursor: "pointer",
    });

    cursor.addEventListener("mousedown", this.onMouseDown);

    this.dom = cursor;
  }

  public onMouseDown = (event: MouseEvent): void => {
    if (!this.progress.playing) {
      this.pausedBeforeUpdate = true;
    }

    this.moving = true;
    this.updateProgress(event);

    document.addEventListener("mouseup", this.onMouseUp);
    document.addEventListener("mousemove", this.onMouseMove);
  };

  private onMouseUp = (event: MouseEvent): void => {
    if (!this.moving) {
      return;
    }

    this.moving = false;
    this.updateProgress(event);

    if (!this.pausedBeforeUpdate) {
      // remain play
      setTimeout(() => {
        this.progress.play();
      }, REMAIN_PLAY_TIMEOUT);
    } else {
      this.pausedBeforeUpdate = false;
    }

    document.removeEventListener("mouseup", this.onMouseUp);
    document.removeEventListener("mousemove", this.onMouseMove);
  };

  private onMouseMove = (event: MouseEvent): void => {
    this.updateProgress(event);
  };

  private updateProgress(event: MouseEvent): void {
    this.progress.updateProgress(getProgressByEvent(this.progress.dom, event));
  }
}

function getProgressByEvent(dom: Element, { clientX }: MouseEvent): number {
  let { left, width } = dom.getClientRects()[0];

  return Math.max(Math.min((clientX - left) / width, 1), 0);
}
