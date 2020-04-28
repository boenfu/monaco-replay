import { IExcerptMessage, FrameMessage, IFrameMessage } from "./protobuf";

export const DEFAULT_CACHE_SIZE = 100;

export class PlayerCache {
  ready = false;

  private cachedValues: string[] = [];

  constructor(
    private cacheModel: Monaco.Model,
    private excerpt: IExcerptMessage,
    private cacheSize = DEFAULT_CACHE_SIZE
  ) {
    this.initialize();
  }

  private initialize = (() => {
    let generator = this.build();

    const next = () => {
      let start = performance.now();
      let res!: IteratorResult<any>;

      do {
        res = generator.next();
      } while (!res.done && performance.now() - start < 25);

      if (res.done) {
        this.ready = true;
        return;
      }

      setTimeout(next);
    };

    return next;
  })();

  private *build() {
    let excerpt = this.excerpt;
    let cacheModel = this.cacheModel;
    let cacheSize = this.cacheSize;
    let cachedValues = this.cachedValues;

    let count = 0;

    let initValue = excerpt.value;

    cachedValues.push(initValue);
    cacheModel.setValue(initValue);

    for (let frame of excerpt.frames) {
      count += 1;

      yield applyFrame(cacheModel, frame);

      if (count === cacheSize) {
        cachedValues.push(cacheModel.getValue());
        count = 0;
      }
    }

    cachedValues.push(cacheModel.getValue());
  }

  getValue(cursor: number): string | undefined {
    let excerpt = this.excerpt;
    let cacheModel = this.cacheModel;
    let cacheSize = this.cacheSize;
    let cachedValues = this.cachedValues;

    let cacheIndex = Math.max(Math.floor(cursor / cacheSize), 0);

    // 没有缓冲好
    if (cacheIndex > cachedValues.length - 1) {
      return;
    }

    cacheModel.setValue(cachedValues[cacheIndex]);

    for (let frame of excerpt.frames.slice(cacheIndex * cacheSize, cursor)) {
      applyFrame(cacheModel, frame);
    }

    return cacheModel.getValue();
  }
}

function applyFrame(model: Monaco.Model, frame: IFrameMessage): void {
  let { operation } = new FrameMessage(frame).toFrame();

  if (operation.length) {
    for (let item of Array.from(operation)) {
      model.pushEditOperations([], [item], () => null);
    }
  }
}
