import { Message, Field } from "protobufjs/light";
import { editor, IPosition } from "monaco-editor";
import { PositionMessage } from "./position";

export type ICursorState = editor.ICursorState;

export class CursorStateMessage extends Message<ICursorState>
  implements ICursorState {
  @Field.d(1, "bool")
  inSelectionMode: boolean;

  @Field.d(2, PositionMessage)
  selectionStart: IPosition;

  @Field.d(3, PositionMessage)
  position: IPosition;

  constructor(cursorState: ICursorState) {
    super(cursorState);

    let { inSelectionMode, selectionStart, position } = cursorState ?? {};

    this.inSelectionMode = inSelectionMode;
    this.selectionStart = selectionStart;
    this.position = position;
  }
}
