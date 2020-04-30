import { editor } from "monaco-editor";

import { Recorder } from "./recorder";
import { Player, PlayerOptions } from "./player";

export interface MonacoEditor {
  getModel(uri?: string): editor.ITextModel | null;
  createModel(
    value: string,
    language?: string,
    uri?: string
  ): editor.ITextModel;
}

export interface MonacoReplayOptions extends PlayerOptions {}

export class MonacoReplay {
  recorder: Recorder;
  player: Player;

  constructor(
    public editor: MonacoEditor,
    public codeEditor: editor.IStandaloneCodeEditor,
    private options?: MonacoReplayOptions
  ) {
    this.recorder = new Recorder(codeEditor);
    this.player = new Player(editor, codeEditor, this.options);
  }
}
