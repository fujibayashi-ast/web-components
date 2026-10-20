import { createWrapper } from "#vue/create-wrapper";
import { MyTabs as MyTabsElement } from "#web-components";
import type { MyTabsEventMap, MyTabsProps } from "#web-components/tabs/types";

export const MyTabs = createWrapper<MyTabsProps, MyTabsEventMap>(MyTabsElement);
