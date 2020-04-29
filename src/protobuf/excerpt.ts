import { Message, Field } from "protobufjs/light";

import { IFrameMessage, FrameMessage } from "./frame";

export interface IExcerptMessage {
  value: string;
  frames: IFrameMessage[];
  timestamp: number;
}

export class ExcerptMessage extends Message<IExcerptMessage>
  implements IExcerptMessage {
  @Field.d(1, "string", "required")
  value!: string;

  @Field.d(2, FrameMessage, "repeated")
  frames!: IFrameMessage[];

  @Field.d(3, "int32", "required")
  timestamp!: number;

  constructor(excerpt: IExcerptMessage) {
    super(excerpt);
  }
}
