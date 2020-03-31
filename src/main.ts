import "fast-text-encoding";

import { Recorder } from "./recorder";
import { FrameMessage } from "./protobuf";
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
  iv = "";

  constructor(private editor: Monaco.Editor) {
    this.recorder = new Recorder(editor);
  }

  start(): void {
    this.iv = this.editor.getValue();
    this.recorder.start();
    return;
  }
  stop(): void {
    this.recorder.stop();

    setTimeout(() => {
      downloadRecord(this.recorder.frames[0], "哈哈.more");
      this.r();
    }, 2000);
  }

  async b() {
    console.log(await readRecordFile());
  }

  r(): void {
    this.playing = true;
    this.index = 0;
    this.editor.updateOptions({ readOnly: true });
    this.editor.focus();
    this.editor.setValue(this.iv);
    this.replay();
  }
  replay(): void {
    let frames = this.recorder.frames;

    console.log(
      frames.length,
      frames.reduce((s, f) => s + f.length, 0),
      frames.reduce(
        (s, f) => JSON.stringify(FrameMessage.decode(f).toFrame()).length + s,
        0
      )
    );

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
