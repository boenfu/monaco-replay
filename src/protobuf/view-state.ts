import { Message, Field } from "protobufjs/light";
import { PositionMessage } from "./position";

export class ViewStateMessage extends Message<Monaco.IViewState>
  implements Monaco.IViewState {
  @Field.d(1, "int32", "optional")
  scrollTop?: number | undefined;

  @Field.d(2, "int32", "optional")
  scrollTopWithoutViewZones?: number | undefined;

  @Field.d(3, "int32")
  scrollLeft!: number;

  @Field.d(4, PositionMessage)
  firstPosition!: Monaco.IPosition;

  @Field.d(5, "int32")
  firstPositionDeltaTop!: number;

  constructor(viewState: Monaco.IViewState) {
    super(viewState);
  }
}
