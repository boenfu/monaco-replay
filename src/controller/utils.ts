export function getMRStyleElement(): HTMLElement {
  let style = document.head.querySelector('[tag="monaco-replay"]');

  if (!style) {
    style = document.createElement("style");
    style.setAttribute("tag", "monaco-replay");

    document.head.appendChild(style);
  }

  return style as HTMLElement;
}

export function injectMRStyle(label: string, css: string): void {
  let style = getMRStyleElement();

  let regex = getMRStyleRegExp(label);

  if (regex.test(style.innerHTML)) {
    return;
  }

  style.innerHTML += `
  /** ${label} **/
  ${css}
  /** ${label}-end **/
 `;
}

export function removeMRStyle(label: string): void {
  let style = getMRStyleElement();

  let regex = getMRStyleRegExp(label);

  style.innerHTML = style.innerHTML.replace(regex, "");
}

function getMRStyleRegExp(label: string): RegExp {
  let commentLeft = "\\/\\*\\*\\s";
  let commentRight = "\\s\\*\\*\\/";
  let commentEnd = "-end";

  return new RegExp(
    `${commentLeft}${label}${commentRight}[\\w\\W]+${commentLeft}${label}${commentEnd}${commentRight}`
  );
}
