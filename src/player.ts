import { readRecordFile } from "./utils";
import {
  ExcerptMessage,
  FrameMessage,
  IFrameMessage,
  IExcerptMessage
} from "./protobuf";
import { PlayerController } from "./controller";

export type IPlayerSpeedX = 0.1 | 1.0 | 1.25 | 1.5 | 2.0;

export interface IPlayer {
  /**
   * 属性返回当前音频/视频的长度，以秒计。
   */
  readonly duration: number;
  /**
   * 设置或返回音频/视频中的当前播放位置（以秒计）
   */
  currentTime: number;
  /**
   * 设置或返回进度，0 - 1
   */
  progress: number;
  controls: boolean;
  /**
   * 设置播放速度
   */
  speedX: IPlayerSpeedX;
  reload(): void;
  play(excerpt: ExcerptMessage | Uint8Array): void;
  pause(): void;
}

export class Player implements IPlayer {
  speedX: IPlayerSpeedX = 1;

  private playing = false;
  private currentExcerpt: IExcerptMessage | undefined;
  private lastRequestAnimationFrameId: number | undefined;

  // unit: millisecond
  private _currentTime = 0;
  private _controls = true;
  private _cursor = 0;
  private _lastRequestTime: number = 0;

  private get lastFrameTimestamp(): number {
    let excerpt = this.currentExcerpt;

    if (!excerpt) {
      return 0;
    }

    let { frames } = excerpt;

    return frames[frames.length - 1]?.timestamp ?? 0;
  }

  get duration(): number {
    return Math.floor(this.lastFrameTimestamp / 1000);
  }

  get currentTime(): number {
    return Math.floor(this._currentTime / 1000);
  }
  set currentTime(second: number) {
    this._currentTime = second * 1000;
    this.checkCursor();
  }

  get progress(): number {
    return this._currentTime / this.lastFrameTimestamp;
  }
  set progress(value: number) {
    this._currentTime = this.lastFrameTimestamp * value;
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
    this.afterPlayEnd();
  }

  play(excerpt?: ExcerptMessage | Uint8Array): void {
    if (excerpt) {
      this.beforePlay(excerpt);
    }

    this.playExcerpt();
  }

  pause(): void {
    this.playing = false;

    if (this.lastRequestAnimationFrameId) {
      cancelAnimationFrame(this.lastRequestAnimationFrameId);
    }
  }

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

    let controller = new PlayerController(this);

    container.appendChild(controller.dom);
  }

  private checkCursor(): void {
    let currentTime = this._currentTime;

    let index = this.currentExcerpt?.frames.findIndex(
      ({ timestamp = 0 }) => timestamp > currentTime
    );
    this._cursor = index ? index - 1 : 0;
  }

  private beforePlay(excerpt: ExcerptMessage | Uint8Array): void {
    if (excerpt instanceof Uint8Array) {
      excerpt = ExcerptMessage.decode(excerpt);
    }

    // set playing excerpt
    this.currentExcerpt = excerpt;

    let editor = this.editor;

    // initialize params
    this.playing = true;
    this._cursor = 0;
    this._lastRequestTime = Date.now();

    editor.focus();
    editor.updateOptions({ readOnly: true });
    editor.setValue(excerpt.value);
  }

  private afterPlayEnd(): void {
    // initialize params
    this.playing = false;
    this._cursor = 0;
    this._lastRequestTime = 0;
  }

  private playExcerpt = (): void => {
    let excerpt = this.currentExcerpt;

    let pendingFrame = excerpt?.frames[this._cursor];

    if (!pendingFrame) {
      // this excerpt end.
      this.afterPlayEnd();
      return;
    }

    let now = Date.now();

    if (pendingFrame.timestamp! <= this._currentTime) {
      this.applyFrame(pendingFrame);
      this._cursor += 1;
    }

    this.updateDuration(now);

    this.lastRequestAnimationFrameId = requestAnimationFrame(this.playExcerpt);
  };

  private updateDuration(now: number): void {
    let cost = now - this._lastRequestTime;

    this._lastRequestTime = now;

    // stop when backend
    if (cost > 1000) {
      return;
    }

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
