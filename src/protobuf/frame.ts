import { Message, Field } from "protobufjs/light";
import { CodeEditorViewStateMessage } from "./editor-view-state";
import { RangeMessage } from "./range";
import { Range } from "../core";

export interface IOperation {
  range: Monaco.IRange;
  text: string | null;
  forceMoveMarkers?: boolean;
}

export class OperationMessage extends Message<IOperation>
  implements IOperation {
  @Field.d(1, RangeMessage)
  range!: Monaco.IRange;

  @Field.d(2, "string", "optional")
  text!: string | null;

  @Field.d(3, "bool", "optional")
  forceMoveMarkers?: boolean | undefined;

  constructor(operation: IOperation) {
    super(operation);
  }
}

export interface IFrameMessage {
  operation: IOperation[];
  viewState: Monaco.ICodeEditorViewState;
  timestamp?: number;
}

export class FrameMessage extends Message<IFrameMessage>
  implements IFrameMessage {
  @Field.d(1, OperationMessage, "repeated")
  operation!: IOperation[];

  @Field.d(2, CodeEditorViewStateMessage)
  viewState!: Monaco.ICodeEditorViewState;

  @Field.d(3, "int32")
  timestamp!: number;

  constructor(frame: IFrameMessage) {
    super(frame);
  }

  toFrame(): Frame {
    let viewState = this.viewState;
    let operation = this.operation?.map(
      ({
        range: { startColumn, startLineNumber, endColumn, endLineNumber },
        text,
        forceMoveMarkers
      }): Monaco.IIdentifiedSingleEditOperation => ({
        text,
        range: new Range(
          startLineNumber,
          startColumn,
          endLineNumber,
          endColumn
        ),
        forceMoveMarkers
      })
    );

    let timestamp = this.timestamp;

    return {
      operation,
      viewState,
      timestamp
    };
  }
}
