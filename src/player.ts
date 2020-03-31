export type IPlayerSpeedX = 1.0 | 1.25 | 1.5 | 2.0;

export interface IPlayer {
  duration: number;
  currentTime: number;
  controls: boolean;
  speedX: IPlayerSpeedX;
  reload(): void;
  play(): void;
  pause(): void;
}

export class Player implements IPlayer {
  speedX: IPlayerSpeedX = 1;

  private _currentTime = 0;
  private _controls = true;

  get duration(): number {
    return 0;
  }

  get currentTime(): number {
    return this._currentTime;
  }
  set currentTime(time: number) {
    this._currentTime = time;
  }

  get controls(): boolean {
    return this._controls;
  }
  set controls(show: boolean) {
    this._controls = show;
  }

  constructor(private dom?: HTMLElement) {}

  reload(): void {
    throw new Error("Method not implemented.");
  }
  play(): void {
    throw new Error("Method not implemented.");
  }
  pause(): void {
    throw new Error("Method not implemented.");
  }

  render(): void {}
}
