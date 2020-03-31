import {
  IOperation,
  IFrameMessage,
  IExcerptMessage,
  CodeEditorViewStateMessage,
  ExcerptMessage
} from "./protobuf";

export interface IRecorder {
  start(): void;
  pause(): void;
  stop(): void;
  getExcerpt(): void;
}

export class Recorder implements IRecorder {
  private lastRequestAnimationFrameId: number | undefined;
  private lastViewStateBytes: Uint8Array | undefined;

  private pendingOperationDict: {
    [key in string]: IOperation[];
  } = {};

  private currentExcerpt: IExcerptMessage | undefined;

  private disposable: Monaco.IDisposable | undefined;

  constructor(private editor: Monaco.Editor) {}

  start(): void {
    this.disposable = this.editor.onDidChangeModelContent(
      this.onModelContentChange
    );

    console.log(this.editor.getValue());

    this.currentExcerpt = {
      value: this.editor.getValue(),
      frames: [],
      timestamp: Date.now()
    };

    this.record();
  }

  pause(): void {}

  stop(): void {
    if (this.disposable) {
      this.disposable.dispose();
      this.disposable = undefined;
    }

    if (this.lastRequestAnimationFrameId) {
      cancelAnimationFrame(this.lastRequestAnimationFrameId);
    }

    console.log(this.currentExcerpt);
  }

  getExcerpt(): IExcerptMessage | undefined {
    return this.currentExcerpt;
  }

  private record = (): void => {
    this.generateFrame();
    requestAnimationFrame(this.record);
  };

  private onModelContentChange = ({
    versionId,
    changes
  }: Monaco.IModelContentChangedEvent): void => {
    this.pendingOperationDict[versionId] = changes.map(
      ({ range, text, forceMoveMarkers }: any): IOperation => ({
        range,
        text,
        forceMoveMarkers
      })
    );
  };

  private generateFrame(): void {
    let currentExcerpt = this.currentExcerpt;

    if (!currentExcerpt) {
      return;
    }

    let operation = Object.values(this.pendingOperationDict).flat();
    let viewState = this.editor.saveViewState()!;
    let timestamp = Date.now() - currentExcerpt.timestamp;

    let viewStateBytes = CodeEditorViewStateMessage.encode(viewState).finish();

    let lastViewStateBytes = this.lastViewStateBytes;

    if (
      !operation.length &&
      lastViewStateBytes?.length &&
      viewStateBytes.every((byte, index) => lastViewStateBytes![index] === byte)
    ) {
      return;
    }

    this.lastViewStateBytes = viewStateBytes;
    this.pendingOperationDict = {};

    currentExcerpt.frames.push({
      operation,
      viewState,
      timestamp
    });
  }
}
