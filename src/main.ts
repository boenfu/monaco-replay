import { Recorder } from "./recorder";
import { Player, PlayerOptions } from "./player";

export interface MonacoReplayOptions extends PlayerOptions {}

export class MonacoReplay {
  recorder: Recorder;
  player: Player;

  constructor(
    public monaco: Monaco.Monaco,
    public editor: Monaco.Editor,
    private options?: MonacoReplayOptions
  ) {
    this.recorder = new Recorder(editor);
    this.player = new Player(monaco, editor, this.options);
  }
}
