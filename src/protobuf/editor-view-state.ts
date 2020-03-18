import { editor } from "monaco-editor";
import { Message, Field } from "protobufjs/light";
import { CursorStateMessage, ICursorState } from "./cursor-state";
import { ViewStateMessage, IViewState } from "./view-state";

type ContributionsState = { [id: string]: any };

export type ICodeEditorViewState = editor.ICodeEditorViewState;

export class CodeEditorViewStateMessage extends Message<ICodeEditorViewState>
  implements ICodeEditorViewState {
  @Field.d(1, CursorStateMessage, "repeated")
  cursorState: ICursorState[];

  @Field.d(2, ViewStateMessage)
  viewState: IViewState;

  contributionsState!: ContributionsState;

  constructor(editorViewState: ICodeEditorViewState) {
    super(editorViewState);

    let { cursorState, viewState } = editorViewState ?? {};

    this.cursorState = cursorState;
    this.viewState = viewState;
  }
}
