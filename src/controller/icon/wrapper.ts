import "./iconfont";
import { injectMRStyle } from "../utils";

export function iconComponent(): HTMLElement {
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

  div.innerHTML = `<svg class="more_icon" aria-hidden="true">
<use xlink:href="#more-play"></use>
</svg>`;

  return div;
}
