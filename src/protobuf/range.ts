import { Message, Field } from "protobufjs/light";

export class RangeMessage extends Message<Monaco.IRange>
  implements Monaco.IRange {
  @Field.d(1, "int32")
  startLineNumber: number;

  @Field.d(2, "int32")
  startColumn: number;

  @Field.d(3, "int32")
  endLineNumber: number;

  @Field.d(4, "int32")
  endColumn: number;

  constructor(range: Monaco.IRange) {
    super(range);

    let { startLineNumber, startColumn, endLineNumber, endColumn } =
      range ?? {};

    this.startLineNumber = startLineNumber;
    this.startColumn = startColumn;
    this.endLineNumber = endLineNumber;
    this.endColumn = endColumn;
  }
}
