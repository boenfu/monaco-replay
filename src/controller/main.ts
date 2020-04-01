import { iconComponent } from "./icon";

interface PlayerEvent {
  onPlay(): void;
  onPause(): void;
  onCurrentTimeChange(second: number): void;
  onSpeedXChange(speed: number): void;
  onChooseFile(): void;
}

export function initializeController({}: Partial<PlayerEvent>): HTMLElement {
  let div = document.createElement("div");

  let start = document.createElement("button");

  start.textContent = " !";
  // start.addEventListener("click", this.playFromFile);

  div.appendChild(start);

  let style: Partial<CSSStyleDeclaration> = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: "10%",
    right: "10%",
    bottom: "10px",
    backgroundColor: "#fff",
    height: "80px",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px"
  };

  Object.assign(div.style, style);

  div.appendChild(iconComponent());

  return div;
}
