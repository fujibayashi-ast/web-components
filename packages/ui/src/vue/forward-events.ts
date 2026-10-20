import { type ComponentPublicInstance, onScopeDispose } from "vue";

export type EventDetail<Event> =
  Event extends CustomEvent<infer Detail> ? Detail : never;

export type ForwardedEmit<EventMap> = <Name extends keyof EventMap & string>(
  event: Name,
  detail: EventDetail<EventMap[NoInfer<Name>]>,
) => void;

/**
 * Returns a Vue **function ref** to put on the inner custom element. For each
 * listed native event it adds a listener that re-emits it as the Vue emit of
 * the same name, passing `event.detail` as the payload. Cleans up on element
 * swap and on scope dispose.
 *
 * ```ts
 * const emit = defineEmits<{ "count-change": [detail: Detail] }>();
 * const forwardRef = forwardEvents<{ "count-change": CustomEvent<Detail> }>(
 *   emit, ["count-change"],
 * );
 * // <my-button :ref="forwardRef" ... />
 * ```
 */
export function forwardEvents<
  EventMap extends {
    [Name in keyof EventMap]: CustomEvent<EventDetail<EventMap[Name]>>;
  },
>(
  emit: ForwardedEmit<EventMap>,
  eventNames: readonly (keyof EventMap & string)[],
): (el: Element | ComponentPublicInstance | null) => void {
  const listeners = eventNames.map(
    (name) =>
      [
        name,
        (event: Event) =>
          emit(
            name,
            (event as CustomEvent<EventDetail<EventMap[typeof name]>>).detail,
          ),
      ] as const,
  );

  let attached: EventTarget | null = null;

  const detach = () => {
    if (!attached) return;
    for (const [name, handler] of listeners) {
      attached.removeEventListener(name, handler);
    }
    attached = null;
  };

  onScopeDispose(detach);

  return (el) => {
    detach();
    const node = el instanceof Element ? el : null;
    if (!node) return;
    for (const [name, handler] of listeners) {
      node.addEventListener(name, handler);
    }
    attached = node;
  };
}
