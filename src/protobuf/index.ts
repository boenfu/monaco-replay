import { editor, IPosition, IRange } from "monaco-editor";
import { Message, Field } from "protobufjs/light";

import { Range } from "../core";

export class PositionMessage extends Message<IPosition> implements IPosition {
  @Field.d(1, "int32")
  lineNumber!: number;

  @Field.d(2, "int32")
  column!: number;

  constructor(position: IPosition) {
    super(position);
  }
}

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

export class ViewStateMessage extends Message<editor.IViewState>
  implements editor.IViewState {
  @Field.d(1, "int32", "optional")
  scrollTop?: number | undefined;

  @Field.d(2, "int32", "optional")
  scrollTopWithoutViewZones?: number | undefined;

  @Field.d(3, "int32")
  scrollLeft!: number;

  @Field.d(4, PositionMessage)
  firstPosition!: IPosition;

  @Field.d(5, "int32")
  firstPositionDeltaTop!: number;

  constructor(viewState: editor.IViewState) {
    super(viewState);
  }
}

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

type ContributionsState = { [id: string]: any };

export class CodeEditorViewStateMessage
  extends Message<editor.ICodeEditorViewState>
  implements editor.ICodeEditorViewState {
  @Field.d(1, CursorStateMessage, "repeated")
  cursorState!: editor.ICursorState[];

  @Field.d(2, ViewStateMessage)
  viewState!: editor.IViewState;

  contributionsState!: ContributionsState;

  constructor(editorViewState: editor.ICodeEditorViewState) {
    super(editorViewState);
  }
}

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
  timestamp: number;
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

export interface IExcerptMessage {
  value: string;
  frames: IFrameMessage[];
  timestamp: number;
}

export class ExcerptMessage extends Message<IExcerptMessage>
  implements IExcerptMessage {
  @Field.d(1, "string", "required")
  value!: string;

  @Field.d(2, FrameMessage, "repeated")
  frames!: IFrameMessage[];

  @Field.d(3, "int32", "required")
  timestamp!: number;

  constructor(excerpt: IExcerptMessage) {
    super(excerpt);
  }
}
