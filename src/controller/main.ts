import { injectMRStyle } from "./utils";
import { Progress, Speed, FileButton, Timer, PlayButton } from "./blocks";
import { Player } from "../player";
import { PRIMARY_COLOR } from "./theme";

const PLAYER_CONTROLLER_CLASS_NAME = "mrp_container";

export interface PlayerControllerOptions {
  showFileButton?: boolean;
}

export class PlayerController {
  dom!: HTMLElement;

  private timer = new Timer();
  private playButton = new PlayButton(this.player);
  private fileButton = new FileButton(this.player);
  private progress = new Progress(this.player);
  private Speed = new Speed(this.player);

  constructor(
    private player: Player,
    private options?: PlayerControllerOptions
  ) {
    this.initialize();
  }

  private initialize(): void {
    let container = document.createElement("div");

    container.classList.add(PLAYER_CONTROLLER_CLASS_NAME);

    injectMRStyle(
      "container",
      `
      .${PLAYER_CONTROLLER_CLASS_NAME} {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: 8%;
        right: 8%;
        bottom: 8px;
        padding: 0 24px;
        background-color: ${PRIMARY_COLOR};
        height: 50px;
        border-top-left-radius: 12px;
        border-top-right-radius: 12px;
        box-shadow: 0 -3px 8px 0 hsla(0, 0%, 0%, 0.06);
        color: #FFF;
        font-size: 14px;
        user-select: none;
      }
      `
    );

    container.append(
      this.playButton.dom,
      this.progress.dom,
      this.timer.dom,
      this.Speed.dom
    );

    if (this.options?.showFileButton) {
      container.append(this.fileButton.dom);
    }

    this.player.addEventListener("timeupdate", this.onTimeUpdate);

    this.dom = container;
  }

  private onTimeUpdate = (): void => {
    let player = this.player;

    this.timer.render(player.currentTime, player.duration);
    this.progress.render(player.progress);
  };

  static isExisted(element: HTMLElement) {
    return !!element?.querySelector(`.${PLAYER_CONTROLLER_CLASS_NAME}`);
  }
}
