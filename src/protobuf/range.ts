import { IRange } from "monaco-editor";
import { Message, Field } from "protobufjs/light";

export class RangeMessage extends Message<IRange> implements IRange {
  @Field.d(1, "int32")
  startLineNumber!: number;

  @Field.d(2, "int32")
  startColumn!: number;

  @Field.d(3, "int32")
  endLineNumber!: number;

  @Field.d(4, "int32")
  endColumn!: number;

  constructor(range: IRange) {
    super(range);
  }
}
