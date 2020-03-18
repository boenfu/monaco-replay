import { editor } from "monaco-editor";

export interface Frame {
  operation: editor.IIdentifiedSingleEditOperation[];
  viewState: editor.ICodeEditorViewState;
}
