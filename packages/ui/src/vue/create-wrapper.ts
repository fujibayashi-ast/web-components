import type { PropertyDeclaration } from "lit";
import { defineComponent, h } from "vue";
import {
  type EventDetail,
  type ForwardedEmit,
  forwardEvents,
} from "./forward-events";

type VueEmits<EventMap> = {
  [Name in keyof EventMap & string]: (
    detail: EventDetail<EventMap[Name]>,
  ) => boolean;
};

export function createWrapper<
  Props extends object,
  EventMap extends {
    [Name in keyof EventMap]: CustomEvent<EventDetail<EventMap[Name]>>;
  } = Record<never, never>,
>(elementClass: {
  tagName: string;
  properties: Record<keyof Props & string, PropertyDeclaration>;
  eventNames?: readonly (keyof EventMap & string)[];
}) {
  const eventNames = elementClass.eventNames ?? [];
  const emits = Object.fromEntries(
    eventNames.map((name) => [
      name,
      (_detail: EventDetail<EventMap[typeof name]>) => true,
    ]),
  ) as VueEmits<EventMap>;

  return defineComponent<Props, VueEmits<EventMap>>(
    (props, { attrs, slots, emit }) => {
      const forwardRef = forwardEvents<EventMap>(
        emit as ForwardedEmit<EventMap>,
        eventNames,
      );

      return () =>
        h(
          elementClass.tagName,
          {
            ...attrs,
            ...Object.fromEntries(
              Object.entries(props).filter(([, value]) => value !== undefined),
            ),
            ref: forwardRef,
          },
          slots.default?.(),
        );
    },
    {
      name: elementClass.tagName,
      inheritAttrs: false,
      props: Object.keys(elementClass.properties) as (keyof Props)[],
      emits,
    },
  );
}
