import {
  RecorderTypeToEvent,
  RecorderEventType,
  RecorderMainEvent,
  RecorderEvent
} from "./recorder";
import * as protobuf from "protobufjs";
import { IFrameMessage, IOperation } from "../protobuf";

const context: Worker & {
  protobuf_root: protobuf.Root;
  frames: Uint8Array[];
} & {
    [TType in RecorderEventType]: (
      data: RecorderTypeToEvent<TType>["main"]
    ) => void;
  } = self as any;

context.frames = [];

//////////////
// protobuf //
//////////////

importScripts(
  "https://cdn.rawgit.com/dcodeIO/protobuf.js/6.8.8/dist/protobuf.min.js"
);

const Root = protobuf.Root;
const Type = protobuf.Type;
const Field = protobuf.Field;

// viewState

const PositionMessage = new Type("Position")
  .add(new Field("lineNumber", 1, "int32"))
  .add(new Field("column", 2, "int32"));

const CursorStateMessage = new Type("CursorState")
  .add(new Field("inSelectionMode", 1, "bool"))
  .add(new Field("selectionStart", 2, "Position"))
  .add(new Field("position", 3, "Position"));

const ViewStateMessage = new Type("ViewState")
  .add(new Field("scrollTop", 1, "int32", "optional"))
  .add(new Field("scrollTopWithoutViewZones", 2, "int32", "optional"))
  .add(new Field("scrollLeft", 3, "int32"))
  .add(new Field("firstPosition", 4, "Position"))
  .add(new Field("firstPositionDeltaTop", 5, "int32"));

const EditorViewStateMessage = new Type("EditorViewState")
  .add(new Field("cursorState", 1, "CursorState", "repeated"))
  .add(new Field("viewState", 2, "ViewState"));

// modelContent

const RangeMessage = new Type("Range")
  .add(new Field("startLineNumber", 1, "int32"))
  .add(new Field("startColumn", 2, "int32"))
  .add(new Field("endLineNumber", 3, "int32"))
  .add(new Field("endColumn", 4, "int32"));

const OperationMessage = new Type("Operation")
  .add(new Field("range", 1, "Range"))
  .add(new Field("text", 2, "string", "optional"))
  .add(new Field("forceMoveMarkers", 3, "bool", "optional"));

// frame

const FrameMessage = new Type("Frame")
  .add(new Field("operation", 1, "Operation", "repeated"))
  .add(new Field("viewState", 2, "EditorViewState"))
  .add(new Field("timestamp", 3, "int32"));

new Root()
  .add(PositionMessage)
  .add(CursorStateMessage)
  .add(ViewStateMessage)
  .add(EditorViewStateMessage)
  .add(RangeMessage)
  .add(OperationMessage)
  .add(FrameMessage);

////////////
// events //
////////////

context.addEventListener(
  "message",
  ({ data: event }: { data: RecorderMainEvent<RecorderEvent> }) => {
    try {
      (context[event.type] as any)?.(event.data);
    } catch (error) {}
  }
);

let startTime: number;

let pendingSyncDict: {
  [key in string]: IOperation[];
} = {};

context.start = function() {
  console.log("start");
  startTime = Date.now();
  record();
};

context.change = function({ clock, changes }) {
  pendingSyncDict[clock] = changes.map(
    ({ range, text, forceMoveMarkers }: any): IOperation => ({
      range,
      text,
      forceMoveMarkers
    })
  );
};

context.sync = function(viewState: Monaco.ICodeEditorViewState): void {
  let operation = Object.values(pendingSyncDict).flat();

  let vb = EditorViewStateMessage.encode(viewState).finish();

  if (!operation.length && vb.every((buf, i) => lastViewState[i] === buf)) {
    lastReq = requestAnimationFrame(record);
    lastViewState = vb;
    return;
  }

  lastViewState = vb;

  let timestamp = Date.now() - startTime;

  let buffer = FrameMessage.encode(
    FrameMessage.create({
      operation,
      viewState,
      timestamp
    })
  ).finish();

  context.frames.push(buffer);

  lastReq = requestAnimationFrame(record);

  pendingSyncDict = {};
};

let lastViewState: Uint8Array = new Uint8Array();

let lastReq: number;

// let f = 0;

function record() {
  // if (f++ % 4) {
  //   cancelAnimationFrame(lastReq);
  //   lastReq = requestAnimationFrame(record);
  //   return;
  // }

  context.postMessage({ type: "sync" });
}

context.stop = function(): void {
  cancelAnimationFrame(lastReq);

  context.postMessage({
    type: "stop",
    data: context.frames
  });
};
