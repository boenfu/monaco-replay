import "fast-text-encoding";
import { editor, IDisposable } from "monaco-editor";

import {
  IOperation,
  IExcerptMessage,
  CodeEditorViewStateMessage,
  IFrameMessage,
} from "./protobuf";
import { saveExcerptMessageToFile, getExcerptMessageFormData } from "./utils";

export interface IRecorder {
  start(initialExcerpt?: { timestamp: number }): void;
  pause(): void;
  stop(): void;
  getExcerpt(): void;
  onFrame?(frame: IFrameMessage): void;
}

export class Recorder implements IRecorder {
  private lastRequestAnimationFrameId: number | undefined;
  private lastViewStateBytes: Uint8Array | undefined;

  private pendingOperationDict: {
    [key in string]: IOperation[];
  } = {};

  private currentExcerpt: IExcerptMessage | undefined;

  private disposable: IDisposable | undefined;

  // hook
  onFrame: IRecorder["onFrame"];

  constructor(private editor: editor.IStandaloneCodeEditor) {}

  start(
    initialExcerpt = {
      timestamp: Date.now(),
    }
  ): void {
    this.disposable = this.editor.onDidChangeModelContent(
      this.onModelContentChange
    );

    this.currentExcerpt = {
      value: this.editor.getValue(),
      frames: [],
      ...initialExcerpt,
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
  }

  getExcerpt(): IExcerptMessage | undefined {
    return this.currentExcerpt;
  }

  getExcerptFormData(
    fieldName?: string,
    fileName?: string
  ): FormData | undefined {
    let excerpt = this.getExcerpt();

    if (!excerpt) {
      return;
    }

    return getExcerptMessageFormData(excerpt, fieldName, fileName);
  }

  saveToFile(name?: string): void {
    let excerpt = this.getExcerpt();

    if (!excerpt) {
      return;
    }

    saveExcerptMessageToFile(excerpt, name);
  }

  private record = (): void => {
    this.generateFrame();

    requestAnimationFrame(this.record);
  };

  private onModelContentChange = ({
    versionId,
    changes,
  }: editor.IModelContentChangedEvent): void => {
    this.pendingOperationDict[versionId] = changes.map(
      ({ range, text, forceMoveMarkers }: any): IOperation => ({
        range,
        text,
        forceMoveMarkers,
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

    let frame: IFrameMessage = {
      operation,
      viewState,
      timestamp,
    };

    if (!currentExcerpt.frames.length) {
      frame.value = this.editor.getValue();
    }

    currentExcerpt.frames.push(frame);

    this.onFrame?.(frame);
  }
}
