import { editor, IPosition } from "monaco-editor";
import { Message, Field } from "protobufjs/light";

import { PositionMessage } from "./position";

export class CursorStateMessage extends Message<editor.ICursorState>
  implements editor.ICursorState {
  @Field.d(1, "bool")
  inSelectionMode!: boolean;

  @Field.d(2, PositionMessage)
  selectionStart!: IPosition;

  @Field.d(3, PositionMessage)
  position!: IPosition;

  constructor(cursorState: editor.ICursorState) {
    super(cursorState);
  }
}
