import { mergeElementStyle } from "../utils";
import { Player } from "../../player";

export class FileButton {
  dom!: HTMLElement;

  constructor(player: Player) {
    let button = document.createElement("span");

    mergeElementStyle(button, { marginLeft: "14px" });

    button.innerText = ". . .";
    button.onclick = player.playFromFile;

    this.dom = button;
  }
}
