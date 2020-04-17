import { readRecordFile } from "./utils";
import {
  ExcerptMessage,
  FrameMessage,
  IFrameMessage,
  IExcerptMessage,
} from "./protobuf";
import { PlayerController } from "./controller";
import { CustomEventTarget } from "./core";

export type PlayerEventType = PlayerEvent["type"];

export type ExtractPlayerEventData<TType extends PlayerEventType> = Extract<
  PlayerEvent,
  { type: TType }
>;

export type PlayerEvent =
  | PlayerStatusEvent
  | PlayerSpeedEvent
  | PlayerErrorEvent;

export type __PlayerEvent<TType, TData> = {
  type: TType;
  data: TData;
};

export type PlayerStatusEvent = __PlayerEvent<"status", { playing: boolean }>;

export type PlayerSpeedEvent = __PlayerEvent<"speed", { speed: number }>;

export type PlayerErrorEvent = __PlayerEvent<"error", { error: Error }>;

export const SPEED = [0.5, 1, 1.5, 2] as const;

export type PlayerSpeed = typeof SPEED[number];

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
  speed: PlayerSpeed;
  reload(): void;
  play(excerpt: ExcerptMessage | Uint8Array): void;
  pause(): void;
}

export class Player extends CustomEventTarget<PlayerEventType>
  implements IPlayer {
  private currentExcerpt: IExcerptMessage | undefined;
  private lastRequestAnimationFrameId: number | undefined;

  private _playing = false;
  // 当前播放的时间 (millisecond)
  private _currentTime = 0;

  // 是否显示控制面板
  private _controls = true;

  // 当前帧数的指针
  private _cursor = 0;

  // 上一帧的播放时间
  private _lastRequestTime: number = 0;

  // 上一帧的播放时间
  private _speed: PlayerSpeed = 1;

  private get lastFrameTimestamp(): number {
    let excerpt = this.currentExcerpt;

    if (!excerpt) {
      return 0;
    }

    let { frames } = excerpt;

    return frames[frames.length - 1]?.timestamp ?? 0;
  }

  get playend(): boolean {
    return (
      !this.playing &&
      this._cursor >= Number(this.currentExcerpt?.frames.length)
    );
  }

  get speed(): PlayerSpeed {
    return this._speed;
  }
  set speed(speed: PlayerSpeed) {
    this._speed = speed;
    this.dispatchEvent(createPlayerEvent("speed", { speed }));
  }

  get playing(): boolean {
    return this._playing;
  }
  set playing(playing: boolean) {
    this._playing = playing;
    this.dispatchEvent(createPlayerEvent("status", { playing }));
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
    super();
    this.initialize();
  }

  reload(): void {
    this.playing = false;
    this.currentTime = 0;

    if (this.currentExcerpt) {
      this.editor.setValue(this.currentExcerpt?.value);
    }
  }

  play(excerpt?: ExcerptMessage | Uint8Array): void {
    if (this.playing) {
      return;
    }

    if (this.playend) {
      this.reload();
    }

    this.beforePlay(excerpt);

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

    let index =
      this.currentExcerpt?.frames.findIndex(
        ({ timestamp = 0 }) => timestamp > currentTime
      ) ?? 0;

    this._cursor = Math.max(index - 1, 0);
  }

  private beforePlay(excerpt: ExcerptMessage | Uint8Array | undefined): void {
    let editor = this.editor;

    if (excerpt) {
      if (excerpt instanceof Uint8Array) {
        excerpt = ExcerptMessage.decode(excerpt);

        editor.setValue(excerpt.value);
        this._cursor = 0;
      }

      // set playing excerpt
      this.currentExcerpt = excerpt;
    }

    editor.focus();
    editor.updateOptions({ readOnly: true });

    // initialize params
    this.playing = true;
    this._lastRequestTime = Date.now();
  }

  private afterPlayEnd(): void {
    this.playing = false;
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

    this._currentTime += cost * this.speed;
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

function createPlayerEvent<TType extends PlayerEventType>(
  type: TType,
  data: ExtractPlayerEventData<TType>["data"]
): CustomEvent {
  return new CustomEvent(type, { detail: data });
}
