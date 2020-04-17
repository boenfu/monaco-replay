import "./iconfont";
import { injectMRStyle, mergeElementStyle } from "../../utils";
import { Player } from "../../../player";

export type PlayType = "play" | "suspend";

export class PlayButton {
  dom!: HTMLElement;

  private playType: PlayType = this.player.playing ? "suspend" : "play";

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

    this.dom = div;
    this.render();
  }

  render(): void {
    this.dom.innerHTML = getIconDomString(this.playType);
  }

  private onPlayButtonClick = (): void => {
    console.log(1, this.player.playing);

    if (this.player.playing) {
      this.player.pause();
    } else {
      this.player.play();
    }
  };
}

function getIconDomString(type: PlayType): string {
  return `<svg class="more_icon" aria-hidden="true"><use xlink:href="#more-${type}"></use></svg>`;
}
