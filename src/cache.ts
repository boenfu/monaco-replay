import { editor } from "monaco-editor";

import {
  IExcerptMessage,
  FrameMessage,
  IFrameMessage,
  ICustomEventMessage,
} from "./protobuf";

export const DEFAULT_CACHE_SIZE = 100;

export interface PlayerCustomEventData extends ICustomEventMessage {
  events: ICustomEventMessage[];
}

export class PlayerCache {
  ready = false;

  private cachedValues: string[] = [];

  private emittedEventCursorMap = new Map<string, number>();

  private categoryToEventsMap = new Map<string, ICustomEventMessage[]>();

  constructor(
    private cacheModel: editor.ITextModel,
    private excerpt: IExcerptMessage,
    private cacheSize = DEFAULT_CACHE_SIZE
  ) {
    this.initialize();
  }

  private initialize = (() => {
    this.categoryToEventsMap = new Map();
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

    let categoryToEventsMap = this.categoryToEventsMap;

    let count = 0;

    let initValue = excerpt.value;

    cachedValues.push(initValue);
    cacheModel.setValue(initValue);

    for (let frame of excerpt.frames) {
      count += 1;

      // collect events
      if (frame.events.length) {
        for (let event of frame.events) {
          let arr = categoryToEventsMap.get(event.name) ?? [];
          arr.push(event);

          categoryToEventsMap.set(event.name, arr);
        }
      }

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

  getEvents(timestamp: number): PlayerCustomEventData[] {
    return [...this.categoryToEventsMap.values()]
      .map((events) => {
        let event = getPreviousEvent(timestamp, events);

        if (
          this.emittedEventCursorMap.get(event.name) === event.events.length
        ) {
          return undefined;
        } else {
          this.emittedEventCursorMap.set(event.name, event.events.length);
        }

        return event;
      })
      .filter((event): event is PlayerCustomEventData => !!event);
  }
}

function applyFrame(model: editor.ITextModel, frame: IFrameMessage): void {
  let { operation } = new FrameMessage(frame).toFrame();

  if (operation.length) {
    for (let item of Array.from(operation)) {
      model.pushEditOperations([], [item], () => null);
    }
  }
}

function getPreviousEvent(
  timestamp: number,
  events: ICustomEventMessage[]
): PlayerCustomEventData {
  // TODO:
  let index = events.findIndex((event) => event.timestamp > timestamp);

  if (index === -1) {
    index = events.length;
  }

  if (index === 0) {
    index = 1;
  }

  return {
    ...events[index - 1],
    events: events.slice(0, index),
  };
}
