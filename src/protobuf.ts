import { editor, IPosition, IRange } from "monaco-editor";
import { Message, Field, Type } from "protobufjs/light";

import { Range } from "./core";

@Type.d("PositionMessage")
export class PositionMessage extends Message<IPosition> implements IPosition {
  @Field.d(0, "int32")
  lineNumber!: number;

  @Field.d(1, "int32")
  column!: number;

  constructor(position: IPosition) {
    super(position);
  }
}

@Type.d("RangeMessage")
export class RangeMessage extends Message<IRange> implements IRange {
  @Field.d(0, "int32")
  startLineNumber!: number;

  @Field.d(1, "int32")
  startColumn!: number;

  @Field.d(2, "int32")
  endLineNumber!: number;

  @Field.d(3, "int32")
  endColumn!: number;

  constructor(range: IRange) {
    super(range);
  }
}

@Type.d("ViewStateMessage")
export class ViewStateMessage extends Message<editor.IViewState>
  implements editor.IViewState {
  @Field.d(0, "int32", "optional")
  scrollTop?: number | undefined;

  @Field.d(1, "int32", "optional")
  scrollTopWithoutViewZones?: number | undefined;

  @Field.d(2, "int32")
  scrollLeft!: number;

  @Field.d(3, PositionMessage)
  firstPosition!: IPosition;

  @Field.d(4, "int32")
  firstPositionDeltaTop!: number;

  constructor(viewState: editor.IViewState) {
    super(viewState);
  }
}

@Type.d("CursorStateMessage")
export class CursorStateMessage extends Message<editor.ICursorState>
  implements editor.ICursorState {
  @Field.d(0, "bool")
  inSelectionMode!: boolean;

  @Field.d(1, PositionMessage)
  selectionStart!: IPosition;

  @Field.d(2, PositionMessage)
  position!: IPosition;

  constructor(cursorState: editor.ICursorState) {
    super(cursorState);
  }
}

type ContributionsState = { [id: string]: any };

@Type.d("CodeEditorViewStateMessage")
export class CodeEditorViewStateMessage
  extends Message<editor.ICodeEditorViewState>
  implements editor.ICodeEditorViewState {
  @Field.d(0, CursorStateMessage, "repeated")
  cursorState!: editor.ICursorState[];

  @Field.d(1, ViewStateMessage)
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

@Type.d("OperationMessage")
export class OperationMessage extends Message<IOperation>
  implements IOperation {
  @Field.d(0, RangeMessage)
  range!: IRange;

  @Field.d(1, "string", "optional")
  text!: string | null;

  @Field.d(2, "bool", "optional")
  forceMoveMarkers?: boolean | undefined;

  constructor(operation: IOperation) {
    super(operation);
  }
}

/**
 * Custom Event
 */
export interface ICustomEventMessage {
  name: string;
  timestamp: number;
  /**
   * JSON string
   */
  payload?: string;
}

@Type.d("CustomEventMessage")
export class CustomEventMessage extends Message<ICustomEventMessage> {
  @Field.d(0, "string")
  name!: string;

  @Field.d(1, "int32")
  timestamp!: number;

  @Field.d(2, "string", "optional")
  payload!: string | null;

  constructor(eventMessage: ICustomEventMessage) {
    super(eventMessage);
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
  events: ICustomEventMessage[];
}

@Type.d("FrameMessage")
export class FrameMessage extends Message<IFrameMessage>
  implements IFrameMessage {
  @Field.d(0, OperationMessage, "repeated")
  operation!: IOperation[];

  @Field.d(1, CodeEditorViewStateMessage)
  viewState!: editor.ICodeEditorViewState;

  @Field.d(2, "int32")
  timestamp!: number;

  @Field.d(3, "string", "optional")
  value?: string | undefined;

  @Field.d(4, CustomEventMessage, "repeated")
  events!: ICustomEventMessage[];

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

@Type.d("ExcerptMessage")
export class ExcerptMessage extends Message<IExcerptMessage>
  implements IExcerptMessage {
  @Field.d(0, "string", "required")
  value!: string;

  @Field.d(1, FrameMessage, "repeated")
  frames!: IFrameMessage[];

  @Field.d(2, "int32", "required")
  timestamp!: number;

  constructor(excerpt: IExcerptMessage) {
    super(excerpt);
  }
}
