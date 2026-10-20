import { createWrapper } from "#react/create-wrapper";
import { MyCard as MyCardElement } from "#web-components";

export type { MyCardProps } from "#web-components";

/**
 * React wrapper for <my-card>. Children are projected into the element's
 * default slot.
 *
 * ```tsx
 * <MyCard label="Notes">
 *   <p>Anything here lands in the card body.</p>
 * </MyCard>
 * ```
 */
export const MyCard = createWrapper<MyCardElement>(MyCardElement);
