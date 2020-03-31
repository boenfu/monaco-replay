export type RecorderEventType =
  | "initialize"
  | "start"
  | "change"
  | "sync"
  | "pause"
  | "stop";

export interface IRecorderEvent<
  TType extends RecorderEventType,
  TMain = undefined,
  TWorker = undefined
> {
  type: TType;
  main: TMain;
  worker: TWorker;
}

export type RecorderStartEvent = IRecorderEvent<"start", string>;

export type RecorderChangeEvent = IRecorderEvent<
  "change",
  { clock: number; changes: Monaco.IModelContentChangedEvent["changes"] }
>;

export type RecorderSyncEvent = IRecorderEvent<
  "sync",
  Monaco.ICodeEditorViewState
>;

export type RecorderPauseEvent = IRecorderEvent<"pause">;

export type RecorderStopEvent = IRecorderEvent<"stop", undefined, Uint8Array[]>;

export type RecorderTypeToEvent<T> = T extends RecorderEventType
  ? Extract<RecorderEvent, { type: T }>
  : never;

export type RecorderEvent =
  | RecorderStartEvent
  | RecorderStopEvent
  | RecorderChangeEvent
  | RecorderSyncEvent
  | RecorderPauseEvent;

export type RecorderMainEvent<T> = T extends RecorderEvent
  ? { type: T["type"]; data: T["main"] }
  : never;

export type RecorderWorkerEvent<T> = T extends RecorderEvent
  ? { type: T["type"]; data: T["worker"] }
  : never;

export interface IRecorder {
  start(): void;
  pause(): void;
  stop(): void;
}

export class Recorder implements IRecorder {
  private worker = new Worker("./@worker.js");
  frames: Uint8Array[] = [];

  private disposable: Monaco.IDisposable | undefined;

  constructor(private editor: Monaco.Editor) {
    this.worker.onmessage = this.onWorkerEvent;
  }

  start(): void {
    this.disposable = this.editor.onDidChangeModelContent(
      this.onModelContentChange
    );

    this.dispatch({ type: "start", main: this.editor.getValue() });
  }

  pause(): void {
    this.dispatch({ type: "pause" });
  }

  stop(): void {
    this.disposable?.dispose();
    this.disposable = undefined;

    this.dispatch({ type: "stop" });
  }

  private onWorkerEvent = ({
    data: event
  }: {
    data: RecorderWorkerEvent<RecorderEvent>;
  }): void => {
    switch (event.type) {
      case "sync":
        {
          this.dispatch({
            type: "sync",
            main: this.editor.saveViewState()!
          });
        }
        break;
      case "stop":
        {
          this.frames = event.data;
        }
        break;
    }
  };

  private onModelContentChange = ({
    versionId,
    changes
  }: Monaco.IModelContentChangedEvent): void => {
    this.dispatch({
      type: "change",
      main: {
        clock: versionId,
        changes
      }
    });
  };

  private dispatch({ type, main }: Partial<RecorderEvent>): void {
    this.worker.postMessage({ type, data: main });
  }
}
