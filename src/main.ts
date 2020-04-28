import { Recorder } from "./recorder";
import { Player } from "./player";

export class MonacoReplay {
  recorder: Recorder;
  player: Player;

  constructor(public monaco: Monaco.Monaco, public editor: Monaco.Editor) {
    this.recorder = new Recorder(editor);
    this.player = new Player(monaco, editor);
  }
}
