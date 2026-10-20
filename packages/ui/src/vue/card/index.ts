import { createWrapper } from "#vue/create-wrapper";
import { MyCard as MyCardElement } from "#web-components";
import type { MyCardProps } from "#web-components/card/types";

export const MyCard = createWrapper<MyCardProps>(MyCardElement);
