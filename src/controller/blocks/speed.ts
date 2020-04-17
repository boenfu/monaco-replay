import { mergeElementStyle, injectMRStyle } from "../utils";
import { PRIMARY_COLOR } from "../theme";
import { SPEED, Player, PlayerSpeed } from "../../player";

export class Speed {
  private readonly prefix = "倍数";
  private popupActive = false;

  dom!: HTMLElement;
  popup!: HTMLElement;

  constructor(private player: Player) {
    let speed = document.createElement("span");

    mergeElementStyle(speed, { cursor: "pointer", position: "relative" });
    speed.appendChild(document.createElement("span"));
    speed.addEventListener("click", this.onClick);

    this.dom = speed;

    this.player.addEventListener("speed", this.onSpeedChange);

    this.initializePopup();

    this.render();
  }

  render(): void {
    (this.dom.firstChild! as HTMLElement).innerText = `${
      this.prefix
    } ${this.player.speed.toFixed(1)}`;
  }

  private onSpeedChange = (): void => {
    this.render();
  };

  private onClick = (): void => {
    this.togglePopup();
  };

  private onPopupClick = (event: MouseEvent): void => {
    event.stopPropagation();

    let speed = (event.target as HTMLElement).dataset.speed;

    if (!speed) {
      return;
    }

    this.player.speed = Number(speed) as PlayerSpeed;

    this.togglePopup();
  };

  private initializePopup(): void {
    let wrapper = document.createElement("div");

    mergeElementStyle(wrapper, {
      position: "absolute",
      flexDirection: "column",
      width: "100%",
      padding: "12px 4px",
      borderRadius: "4px",
      background: PRIMARY_COLOR,
      color: "#fff",
      bottom: "calc(100% + 24px)",
      left: "50%",
      transform: "translateX(-50%)",
      display: getDisplayValue(this.popupActive),
    });

    let className = "more_speed";
    wrapper.classList.add(className);

    injectMRStyle(
      "speed",
      `
      .${className} > * {
        border-radius: 2px;
        padding: 4px;
        text-align: center;
      }
      
      .${className} > *:hover {
        background-color: #ffffff22;
      }
    `
    );

    wrapper.addEventListener("click", this.onPopupClick);
    wrapper.append(...SPEED.map(createSpeedItem));

    this.popup = wrapper;
    this.dom.appendChild(wrapper);
  }

  private togglePopup(): void {
    let active = !this.popupActive;
    this.popupActive = active;

    mergeElementStyle(this.popup, {
      display: getDisplayValue(active),
    });
  }
}

function createSpeedItem(speed: number): HTMLElement {
  let span = document.createElement("span");

  span.innerText = `${speed.toFixed(1)} X`;
  span.dataset.speed = String(speed);

  return span;
}

function getDisplayValue(active: boolean): string {
  return active ? "flex" : "none";
}
