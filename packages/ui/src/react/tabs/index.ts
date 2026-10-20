import { createWrapper } from "#react/create-wrapper";
import { MyTabs as MyTabsElement, type MyTabsEventMap } from "#web-components";

export type {
  MyTab,
  MyTabsEventMap,
  MyTabsProps,
  MyTabsValueChangeDetail,
} from "#web-components";

export const MyTabs = createWrapper<MyTabsElement, MyTabsEventMap>(
  MyTabsElement,
);
