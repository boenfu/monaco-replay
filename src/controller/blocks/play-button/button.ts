import "./iconfont";
import { injectMRStyle, mergeElementStyle } from "../../utils";
import { Player, PlayerStatusEvent } from "../../../player";

export type PlayType = "play" | "suspend";

export class PlayButton {
  dom!: HTMLElement;

  private playType: PlayType = getPlayTypeByStatus(this.player.playing);

  constructor(private player: Player) {
    injectMRStyle(
      "icon",
      `
      .more_icon {
        width: 1em;
        height: 1em;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
      }
      `
    );

    let div = document.createElement("div");

    mergeElementStyle(div, {
      fontSize: "16px",
      cursor: "pointer",
    });

    div.addEventListener("click", this.onPlayButtonClick, true);
    player.addEventListener("status", this.onStatusChange);

    this.dom = div;
    this.render();
  }

  render(): void {
    this.dom.innerHTML = getIconDomString(this.playType);
  }

  private onStatusChange = ({
    detail: { playing },
  }: CustomEvent<PlayerStatusEvent["data"]>): void => {
    this.playType = getPlayTypeByStatus(playing);
    this.render();
  };

  private onPlayButtonClick = (): void => {
    if (this.player.playing) {
      this.player.pause();
    } else {
      this.player.play();
    }
  };
}

function getPlayTypeByStatus(playing: boolean): PlayType {
  return playing ? "suspend" : "play";
}

function getIconDomString(type: PlayType): string {
  return `<svg class="more_icon" aria-hidden="true"><use xlink:href="#more-${type}"></use></svg>`;
}
