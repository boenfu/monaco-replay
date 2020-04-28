import * as monaco from "monaco-editor/esm/vs/editor/editor.main.js";
import { MonacoReplay } from "../lib/main";

self.MonacoEnvironment = {
  getWorkerUrl: function (_, label) {
    if (label === "json") {
      return "./json.worker.js";
    }
    if (label === "css") {
      return "./css.worker.js";
    }
    if (label === "html") {
      return "./html.worker.js";
    }
    if (label === "typescript" || label === "javascript") {
      return "./ts.worker.js";
    }
    return "./editor.worker.js";
  },
};

let editor = monaco.editor.create(document.getElementById("container"), {
  value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
  language: "javascript",
  theme: "vs-dark",
});

window.rp = new MonacoReplay(monaco, editor);
