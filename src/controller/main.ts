import { mergeElementStyle } from "./utils";
import {
  Progress,
  getSpeedBlock,
  FileButton,
  Timer,
  PlayButton,
} from "./blocks";
import { Player } from "../player";
import { PRIMARY_COLOR } from "./theme";

export class PlayerController {
  dom!: HTMLElement;

  private timer = new Timer();
  private playButton = new PlayButton(this.player);
  private fileButton = new FileButton(this.player);
  private progress = new Progress(this.player);

  constructor(private player: Player) {
    this.initialize();

    requestAnimationFrame(this.render);
  }

  private render = (): void => {
    let player = this.player;

    this.timer.render(player.currentTime, player.duration);
    this.progress.render(player.progress);
    this.playButton.render();

    requestAnimationFrame(this.render);
  };

  private initialize(): void {
    let container = document.createElement("div");

    mergeElementStyle(container, {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      left: "8%",
      right: "8%",
      bottom: "8px",
      padding: "0 24px",
      backgroundColor: PRIMARY_COLOR,
      height: "50px",
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
      boxShadow: "0 -3px 8px 0 hsla(0, 0%, 0%, 0.06)",
      color: "#FFF",
      fontSize: "14px",
      userSelect: "none",
    });

    container.append(
      this.playButton.dom,
      this.progress.dom,
      this.timer.dom,
      getSpeedBlock(),
      this.fileButton.dom
    );

    this.dom = container;
  }
}
