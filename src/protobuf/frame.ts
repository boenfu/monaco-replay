import { Message, Field } from "protobufjs/light";
import { editor, IRange } from "monaco-editor";

import { CodeEditorViewStateMessage } from "./editor-view-state";
import { RangeMessage } from "./range";
import { Range } from "../core";

export interface Frame {
  operation: editor.IIdentifiedSingleEditOperation[];
  viewState: editor.ICodeEditorViewState;
  timestamp: number;
  value?: string;
}

export interface IOperation {
  range: IRange;
  text: string | null;
  forceMoveMarkers?: boolean;
}

export class OperationMessage extends Message<IOperation>
  implements IOperation {
  @Field.d(1, RangeMessage)
  range!: IRange;

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
  viewState: editor.ICodeEditorViewState;
  timestamp?: number;
  /**
   * in first frame
   */
  value?: string;
}

export class FrameMessage extends Message<IFrameMessage>
  implements IFrameMessage {
  @Field.d(1, OperationMessage, "repeated")
  operation!: IOperation[];

  @Field.d(2, CodeEditorViewStateMessage)
  viewState!: editor.ICodeEditorViewState;

  @Field.d(3, "int32")
  timestamp!: number;

  @Field.d(4, "string", "optional")
  value?: string | undefined;

  constructor(frame: IFrameMessage) {
    super(frame);
  }

  toFrame(): Frame {
    let viewState = this.viewState;
    let operation = this.operation?.map(
      ({
        range: { startColumn, startLineNumber, endColumn, endLineNumber },
        text,
        forceMoveMarkers,
      }): editor.IIdentifiedSingleEditOperation => ({
        text,
        range: new Range(
          startLineNumber,
          startColumn,
          endLineNumber,
          endColumn
        ),
        forceMoveMarkers,
      })
    );

    let timestamp = this.timestamp;

    return {
      operation,
      viewState,
      timestamp,
    };
  }
}
