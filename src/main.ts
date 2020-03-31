import "fast-text-encoding";

import { Recorder } from "./recorder";
import { FrameMessage, ExcerptMessage } from "./protobuf";
import { downloadRecord, readRecordFile } from "./utils";

export interface MonacoReplayOption {
  /**
   * default `15`
   */
  fps: number;
}

export class MonacoReplay {
  recorder: Recorder;
  playing = false;
  index = 0;

  constructor(private editor: Monaco.Editor) {
    this.recorder = new Recorder(editor);
  }

  start(): void {
    this.recorder.start();
  }

  stop(): void {
    this.recorder.stop();
  }

  saveToFile(name?: string): void {
    let excerpt = this.recorder.getExcerpt();

    if (!excerpt) {
      return;
    }

    let bytes = ExcerptMessage.encode(excerpt).finish();

    console.log(bytes);

    downloadRecord(bytes, name);
  }

  async playFromFile(): Promise<void> {
    let bytes = await readRecordFile();

    console.log(bytes);

    let excerpt = ExcerptMessage.decode(bytes);

    console.log(excerpt);
  }

  r(): void {
    this.playing = true;
    this.index = 0;
    this.editor.updateOptions({ readOnly: true });
    this.editor.focus();

    let { value } = this.recorder.getExcerpt()!;
    this.editor.setValue(value);
    this.replay();
  }

  replay(): void {
    let { frames: fs } = this.recorder.getExcerpt()!;

    let frames = fs.map(f => FrameMessage.encode(f).finish());

    if (this.index < frames.length) {
      requestAnimationFrame(() => {
        let { operation, viewState } = FrameMessage.decode(
          frames[this.index]
        ).toFrame();

        if (operation.length) {
          Array.from(operation).forEach(i =>
            this.editor.getModel()!.pushEditOperations([], [i], () => [])
          );
        }

        this.editor.restoreViewState(viewState);
        this.index += 1;
        this.replay.call(this);
      });
    } else {
      this.playing = false;
    }
  }
}
