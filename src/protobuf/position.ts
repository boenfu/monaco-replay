import { IPosition } from "monaco-editor";
import { Message, Field } from "protobufjs/light";

export class PositionMessage extends Message<IPosition> implements IPosition {
  @Field.d(1, "int32")
  lineNumber!: number;

  @Field.d(2, "int32")
  column!: number;

  constructor(position: IPosition) {
    super(position);
  }
}
