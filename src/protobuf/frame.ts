import { Message, Field } from "protobufjs/light";
import { CodeEditorViewStateMessage } from "./editor-view-state";
import { RangeMessage } from "./range";
import { Frame } from "../models";
import { Range } from "../core";

interface IOperation {
  range: Monaco.IRange;
  text: string | null;
  forceMoveMarkers?: boolean;
}

class OperationMessage extends Message<IOperation> implements IOperation {
  @Field.d(1, RangeMessage)
  range: Monaco.IRange;

  @Field.d(2, "string", "optional")
  text: string | null;

  @Field.d(3, "bool", "optional")
  forceMoveMarkers?: boolean | undefined;

  constructor(operation: IOperation) {
    super(operation);

    let { range, text, forceMoveMarkers } = operation ?? {};

    this.range = range;
    this.text = text;
    this.forceMoveMarkers = forceMoveMarkers;
  }
}

interface IFrameMessage {
  operation: IOperation[];
  viewState: Monaco.ICodeEditorViewState;
}

export class FrameMessage extends Message<IFrameMessage>
  implements IFrameMessage {
  @Field.d(1, OperationMessage, "repeated")
  operation: IOperation[];

  @Field.d(2, CodeEditorViewStateMessage)
  viewState: Monaco.ICodeEditorViewState;

  constructor(frame: IFrameMessage) {
    super(frame);

    let { operation, viewState } = frame ?? {};

    this.operation = operation;
    this.viewState = viewState;
  }

  toFrame(): Frame {
    let viewState = this.viewState;
    let operation = this.operation.map(
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

    return {
      operation,
      viewState
    };
  }
}
