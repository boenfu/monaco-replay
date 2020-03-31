import { Message, Field } from "protobufjs/light";
import { CursorStateMessage } from "./cursor-state";
import { ViewStateMessage } from "./view-state";

type ContributionsState = { [id: string]: any };

export class CodeEditorViewStateMessage
  extends Message<Monaco.ICodeEditorViewState>
  implements Monaco.ICodeEditorViewState {
  @Field.d(1, CursorStateMessage, "repeated")
  cursorState!: Monaco.ICursorState[];

  @Field.d(2, ViewStateMessage)
  viewState!: Monaco.IViewState;

  contributionsState!: ContributionsState;

  constructor(editorViewState: Monaco.ICodeEditorViewState) {
    super(editorViewState);
  }
}
