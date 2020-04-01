import { readRecordFile } from "./utils";
import {
  ExcerptMessage,
  FrameMessage,
  IFrameMessage,
  IExcerptMessage
} from "./protobuf";
import { initializeController } from "./controller";

export type IPlayerSpeedX = 0.1 | 1.0 | 1.25 | 1.5 | 2.0;

export interface IPlayer {
  /**
   * 属性返回当前音频/视频的长度，以秒计。
   */
  duration: number;
  /**
   * 设置或返回音频/视频中的当前播放位置（以秒计）
   */
  currentTime: number;
  controls: boolean;
  speedX: IPlayerSpeedX;
  reload(): void;
  play(excerpt: ExcerptMessage | Uint8Array): void;
  pause(): void;
}

export class Player implements IPlayer {
  lastRequestTime: number = 0;
  playing = false;
  cursor = 0;

  speedX: IPlayerSpeedX = 1;

  private currentExcerpt: IExcerptMessage | undefined;

  // 毫秒
  private _currentTime = 0;
  private _controls = true;

  get duration(): number {
    let excerpt = this.currentExcerpt;

    if (!excerpt) {
      return 0;
    }

    let { frames } = excerpt;

    let lastFrameTimestamp = frames[frames.length - 1]?.timestamp ?? 0;

    return Math.floor(lastFrameTimestamp / 1000);
  }

  get currentTime(): number {
    return Math.floor(this._currentTime / 1000);
  }
  set currentTime(second: number) {
    this._currentTime = second * 1000;
    this.checkCursor();
  }

  get controls(): boolean {
    return this._controls;
  }
  set controls(show: boolean) {
    this._controls = show;
  }

  constructor(private editor: Monaco.Editor) {
    this.initialize();
  }

  reload(): void {
    this.afterPlay();
  }

  play(excerpt: ExcerptMessage | Uint8Array): void {
    console.time("start");

    this.beforePlay(excerpt);

    this.playExcerpt();
  }

  pause(): void {
    throw new Error("Method not implemented.");
  }

  render(): void {}

  playFromFile = async (): Promise<void> => {
    let bytes = await readRecordFile();

    this.play(bytes);
  };

  private initialize(): void {
    let container = this.editor.getContainerDomNode();

    if (!container) {
      return;
    }

    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

    container.appendChild(initializeController({}));
  }

  private checkCursor(): void {}

  private beforePlay(excerpt: ExcerptMessage | Uint8Array): void {
    if (excerpt instanceof Uint8Array) {
      excerpt = ExcerptMessage.decode(excerpt);
    }

    // set playing excerpt
    this.currentExcerpt = excerpt;

    let editor = this.editor;

    // initialize params
    this.playing = true;
    this.cursor = 0;
    this.lastRequestTime = Date.now();

    editor.focus();
    editor.updateOptions({ readOnly: true });
    editor.setValue(excerpt.value);
  }

  private afterPlay(): void {
    // initialize params
    this.playing = false;
    this.cursor = 0;
    this.lastRequestTime = 0;
  }

  private playExcerpt = (): void => {
    let excerpt = this.currentExcerpt;

    let pendingFrame = excerpt?.frames[this.cursor];

    if (!pendingFrame) {
      // this excerpt end.
      console.timeEnd("start");
      console.log(this.duration);

      this.afterPlay();
      return;
    }

    let now = Date.now();

    if (pendingFrame.timestamp! <= this._currentTime) {
      this.applyFrame(pendingFrame);
      this.cursor += 1;
    }

    this.updateDuration(now);

    requestAnimationFrame(this.playExcerpt);
  };

  private updateDuration(now: number): void {
    let cost = now - this.lastRequestTime;

    this.lastRequestTime = now;

    this._currentTime += cost * this.speedX;
  }

  private applyFrame(frame: IFrameMessage): void {
    let { operation, viewState } = new FrameMessage(frame).toFrame();

    if (operation.length) {
      let model = this.editor.getModel();

      if (!model) {
        return;
      }

      for (let item of Array.from(operation)) {
        model.pushEditOperations([], [item], () => null);
      }
    }

    this.editor.restoreViewState(viewState);
  }
}
