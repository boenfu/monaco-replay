import { Message, Field } from "protobufjs/light";
import { editor } from "monaco-editor";

import { CursorStateMessage } from "./cursor-state";
import { ViewStateMessage } from "./view-state";

type ContributionsState = { [id: string]: any };

export class CodeEditorViewStateMessage
  extends Message<editor.ICodeEditorViewState>
  implements editor.ICodeEditorViewState {
  @Field.d(1, CursorStateMessage, "repeated")
  cursorState!: editor.ICursorState[];

  @Field.d(2, ViewStateMessage)
  viewState!: editor.IViewState;

  contributionsState!: ContributionsState;

  constructor(editorViewState: editor.ICodeEditorViewState) {
    super(editorViewState);
  }
}
