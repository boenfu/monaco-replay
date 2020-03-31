import { Message, Field } from "protobufjs/light";
import { PositionMessage } from "./position";

export class CursorStateMessage extends Message<Monaco.ICursorState>
  implements Monaco.ICursorState {
  @Field.d(1, "bool")
  inSelectionMode!: boolean;

  @Field.d(2, PositionMessage)
  selectionStart!: Monaco.IPosition;

  @Field.d(3, PositionMessage)
  position!: Monaco.IPosition;

  constructor(cursorState: Monaco.ICursorState) {
    super(cursorState);
  }
}
