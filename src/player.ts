import { readRecordFile } from "./utils";
import {
  ExcerptMessage,
  FrameMessage,
  IFrameMessage,
  IExcerptMessage,
} from "./protobuf";
import { PlayerController, PlayerControllerOptions } from "./controller";
import { CustomEventTarget } from "./core";
import { PlayerCache } from "./cache";

export type PlayerEventType = PlayerEvent["type"];

export type ExtractPlayerEventData<TType extends PlayerEventType> = Extract<
  PlayerEvent,
  { type: TType }
>;

export type PlayerEvent =
  | PlayerTimeupdateEvent
  | PlayerStatusEvent
  | PlayerSpeedEvent
  | PlayerErrorEvent;

export interface IPlayerEvent<TType, TData> {
  type: TType;
  data: TData;
}

export type PlayerTimeupdateEvent = IPlayerEvent<"timeupdate", undefined>;

export type PlayerStatusEvent = IPlayerEvent<"status", { playing: boolean }>;

export type PlayerSpeedEvent = IPlayerEvent<"speed", { speed: number }>;

export type PlayerErrorEvent = IPlayerEvent<"error", { error: Error }>;

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

export interface PlayerOptions extends PlayerControllerOptions {
  showController?: boolean;
}

export class Player extends CustomEventTarget<PlayerEventType>
  implements IPlayer {
  private currentExcerpt: IExcerptMessage | undefined;
  private requestAnimationFrameId: number | undefined;

  private controller: PlayerController | undefined;

  private cache: PlayerCache | undefined;
  private cacheModel!: Monaco.Model;

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

  // 最后一帧的时间戳
  private get lastFrameTimestamp(): number {
    let excerpt = this.currentExcerpt;

    if (!excerpt) {
      return 0;
    }

    let { frames } = excerpt;

    return frames[frames.length - 1]?.timestamp ?? 0;
  }

  get ended(): boolean {
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
    this.dispatchEvent(createEvent("speed", { speed }));
  }

  get playing(): boolean {
    return this._playing;
  }
  set playing(playing: boolean) {
    this._playing = playing;
    this.dispatchEvent(createEvent("status", { playing }));
  }

  get duration(): number {
    return Math.floor(this.lastFrameTimestamp / 1000);
  }

  get currentTime(): number {
    return Math.floor(this._currentTime / 1000);
  }
  set currentTime(second: number) {
    this.handleTimeupdate(second * 1000);
  }

  get progress(): number {
    return this._currentTime / this.lastFrameTimestamp;
  }
  set progress(value: number) {
    this.handleTimeupdate(this.lastFrameTimestamp * value);
  }

  get controls(): boolean {
    return this._controls;
  }
  set controls(show: boolean) {
    this._controls = show;
  }

  constructor(
    private monaco: Monaco.Monaco,
    private editor: Monaco.Editor,
    private options?: PlayerOptions
  ) {
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

    if (this.ended) {
      this.reload();
    }

    this.beforePlay(excerpt);

    this.playExcerpt();
  }

  pause(): void {
    this.playing = false;

    if (this.requestAnimationFrameId) {
      cancelAnimationFrame(this.requestAnimationFrameId);
    }
  }

  playFromFile = async (): Promise<void> => {
    let bytes = await readRecordFile();

    this.play(bytes);
  };

  showController(): void {
    let container = this.editor.getContainerDomNode();

    if (!container || PlayerController.isExisted(container)) {
      return;
    }

    if (getComputedStyle(container).position === "static") {
      container.style.position = "relative";
    }

    let controller = new PlayerController(this, this.options);

    container.appendChild(controller.dom);

    this.controller = controller;
  }

  private initialize(): void {
    // controller
    if (this.options?.showController) {
      this.showController();
    }

    // cache
    this.cacheModel = this.monaco.editor.createModel("", undefined, "mrp");
  }

  private handleTimeupdate(newCurrentTime: number): void {
    // TODO (boen): 🔍查找 index 可以换成二分
    let newCursor = Math.max(
      (this.currentExcerpt?.frames.findIndex(
        ({ timestamp = 0 }) => timestamp > newCurrentTime
      ) ?? 0) - 1,
      0
    );

    let newValue = this.cache?.getValue(newCursor);

    if (!newValue) {
      return;
    }

    this._currentTime = newCurrentTime;

    this.dispatchEvent(createEvent("timeupdate", undefined));

    this._cursor = newCursor;

    this.editor.setValue(newValue);
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

      // build cache
      this.cache = new PlayerCache(this.cacheModel, this.currentExcerpt);
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

    this.requestAnimationFrameId = requestAnimationFrame(this.playExcerpt);
  };

  private updateDuration(now: number): void {
    let cost = now - this._lastRequestTime;

    this._lastRequestTime = now;

    // stop when backend
    if (cost > 1000) {
      return;
    }

    this._currentTime += cost * this.speed;

    this.dispatchEvent(createEvent("timeupdate", undefined));
  }

  private applyFrame(frame: IFrameMessage): void {
    let { operation, viewState, value } = new FrameMessage(frame).toFrame();

    if (operation.length) {
      let model = this.editor.getModel();

      if (!model) {
        return;
      }

      if (value) {
        this.editor.setValue(value);
      }

      for (let item of Array.from(operation)) {
        model.pushEditOperations([], [item], () => null);
      }
    }

    this.editor.restoreViewState(viewState);
  }
}

function createEvent<TType extends PlayerEventType>(
  type: TType,
  data: ExtractPlayerEventData<TType>["data"]
): CustomEvent {
  return new CustomEvent(type, { detail: data });
}
