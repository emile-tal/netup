import { useState } from 'react';

import Collapsible from '../Collapsible';
import DayDrawer from './DayDrawer';

interface DrawerSlotProps {
  /** The selected day when it falls in this week, otherwise `null`. */
  date: Date | null;
}

/**
 * The place under one week row where that week's `DayDrawer` unfolds. It keeps rendering
 * the last day it showed while folding shut, which is what lets the drawer animate closed
 * instead of vanishing: `MonthView` has already moved on (`date` is `null`) by then.
 *
 * Moving to a day in another week folds this slot while that week's slot unfolds, so for
 * the length of the animation two drawers exist (CLAUDE.md §20).
 */
const DrawerSlot = ({ date }: DrawerSlotProps) => {
  const [shownDate, setShownDate] = useState(date);
  // Adjusting state during render: the slot follows a new day immediately, but holds on
  // to the old one when `date` goes to `null` until the fold has finished.
  if (date && date !== shownDate) setShownDate(date);

  if (!shownDate) return null;
  return (
    <Collapsible open={date !== null} onClosed={() => setShownDate(null)}>
      <DayDrawer date={shownDate} />
    </Collapsible>
  );
};

export default DrawerSlot;
