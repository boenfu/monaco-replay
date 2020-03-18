import { Message, Field } from "protobufjs/light";
import { editor, IPosition } from "monaco-editor";
import { PositionMessage } from "./position";

export type IViewState = editor.IViewState;

export class ViewStateMessage extends Message<IViewState>
  implements IViewState {
  @Field.d(1, "int32", "optional")
  scrollTop?: number | undefined;

  @Field.d(2, "int32", "optional")
  scrollTopWithoutViewZones?: number | undefined;

  @Field.d(3, "int32")
  scrollLeft: number;

  @Field.d(4, PositionMessage)
  firstPosition: IPosition;

  @Field.d(5, "int32")
  firstPositionDeltaTop: number;

  constructor(viewState: IViewState) {
    super(viewState);

    let {
      scrollTop,
      scrollTopWithoutViewZones,
      scrollLeft,
      firstPosition,
      firstPositionDeltaTop
    } = viewState ?? {};

    this.scrollTop = scrollTop;
    this.scrollTopWithoutViewZones = scrollTopWithoutViewZones;
    this.scrollLeft = scrollLeft;
    this.firstPosition = firstPosition;
    this.firstPositionDeltaTop = firstPositionDeltaTop;
  }
}
