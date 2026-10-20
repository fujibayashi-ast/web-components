import {
  createComponent,
  type EventName,
  type ReactWebComponent,
} from "@lit/react";
import * as React from "react";

type Constructor<T> = { new (): T };

type CamelCase<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : S;

/** `"count-change"` -> `"onCountChange"` */
type OnEventName<S extends string> = `on${Capitalize<CamelCase<S>>}`;

type ReactEventProps<EventMap> = {
  [K in keyof EventMap & string as OnEventName<K>]: EventMap[K] extends Event
    ? EventName<EventMap[K]>
    : never;
};

function toOnEventName(domEventName: string): string {
  return `on${domEventName.replace(/(^|-)([a-z])/g, (_m, _sep, ch: string) =>
    ch.toUpperCase(),
  )}`;
}

/**
 * Thin `@lit/react` `createComponent` wrapper.
 *
 * - `tagName` and the DOM event names come from the element's `static tagName` /
 *   `static eventNames` — nothing is restated in the wrapper.
 * - Event handler props are derived from the `*EventMap` type param: `onXxx`
 *   prop names and `CustomEvent` payload types are generated, no
 *   `as EventName<CustomEvent<…>>` casts.
 *
 * ```ts
 * export const MyButton = createWrapper<MyButtonElement, MyButtonEventMap>(
 *   MyButtonElement,
 * );
 * // <MyButton onCountChange={(e) => e.detail.count} />  ← fully typed
 * ```
 */
export function createWrapper<
  El extends HTMLElement,
  EventMap extends { [K in keyof EventMap]: Event } = Record<never, Event>,
>(
  elementClass: Constructor<El> & {
    tagName: string;
    eventNames?: readonly (keyof EventMap & string)[];
    usesLightDom?: boolean;
  },
): ReactWebComponent<El, ReactEventProps<EventMap>> {
  const events = Object.fromEntries(
    (elementClass.eventNames ?? []).map((name) => [
      toOnEventName(name),
      name as EventName<EventMap[typeof name]>,
    ]),
  ) as ReactEventProps<EventMap>;

  const component = createComponent({
    react: React,
    tagName: elementClass.tagName,
    elementClass,
    events,
  });

  if (!elementClass.usesLightDom) return component;

  const innerHTML = { __html: "" };
  const runtimeComponent = component as React.ForwardRefExoticComponent<
    React.HTMLAttributes<El> & React.RefAttributes<El>
  >;
  const wrapper = React.forwardRef<El, React.HTMLAttributes<El>>((props, ref) =>
    React.createElement(runtimeComponent, {
      ...props,
      ref,
      dangerouslySetInnerHTML: innerHTML,
    }),
  );
  wrapper.displayName = elementClass.tagName;
  return wrapper as typeof component;
}
