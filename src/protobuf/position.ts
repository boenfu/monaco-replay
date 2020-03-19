import { Message, Field } from "protobufjs/light";

export class PositionMessage extends Message<Monaco.IPosition>
  implements Monaco.IPosition {
  @Field.d(1, "int32")
  lineNumber: number;

  @Field.d(2, "int32")
  column: number;

  constructor(position: Monaco.IPosition) {
    super(position);

    let { lineNumber, column } = position ?? {};

    this.lineNumber = lineNumber;
    this.column = column;
  }
}
