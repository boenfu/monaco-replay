export class CustomEventTarget<TType extends string, TData = any> {
  constructor(
    private listeners: {
      [key in TType]: ((event: CustomEvent<TData>) => void)[];
    } = {} as any
  ) {}

  addEventListener(
    type: TType,
    callback: (event: CustomEvent<TData>) => void
  ): void {
    if (!(type in this.listeners)) {
      this.listeners[type] = [];
    }

    this.listeners[type].push(callback);
  }

  removeEventListener(
    type: TType,
    callback: (event: CustomEvent<TData>) => void
  ): void {
    if (!(type in this.listeners)) {
      return;
    }

    let stack = this.listeners[type];

    for (let i = 0, l = stack.length; i < l; i++) {
      if (stack[i] === callback) {
        stack.splice(i, 1);
        return this.removeEventListener(type, callback);
      }
    }
  }

  dispatchEvent(event: CustomEvent<TData>): boolean {
    if (!(event.type in this.listeners)) {
      return false;
    }

    let stack = this.listeners[event.type as TType];

    for (let i = 0, l = stack.length; i < l; i++) {
      stack[i].call(this, event);
    }

    return true;
  }
}
