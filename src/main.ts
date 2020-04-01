import "fast-text-encoding";

import { Recorder } from "./recorder";
import { ExcerptMessage } from "./protobuf";
import { saveRecordBytes } from "./utils";
import { Player } from "./player";

export interface MonacoReplayOption {
  fps: number;
}

export class MonacoReplay {
  recorder: Recorder;
  player: Player;

  constructor(private editor: Monaco.Editor) {
    this.recorder = new Recorder(editor);
    this.player = new Player(editor);
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

    saveRecordBytes(bytes, name);
  }
}
