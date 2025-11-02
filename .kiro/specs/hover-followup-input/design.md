# Design Document

## Overview

This design implements a hover-based interaction pattern for the ConversationNode component that dynamically shows and hides the footer section containing the followup input field. The solution uses React state management combined with CSS transitions to create smooth animations for both the node height and footer content visibility. The design ensures the footer remains accessible when users are actively typing while providing a cleaner default view.

## Architecture

### Component Structure

The ConversationNode component will be modified to:
1. Track hover and focus states using React hooks
2. Conditionally render the footer section based on combined hover/focus state
3. Apply CSS transitions for smooth height and opacity animations
4. Maintain existing functionality for followup question submission

### State Management

**New State Variables:**
- `isHovered`: Boolean tracking mouse hover state over the entire card
- `isInputFocused`: Boolean tracking focus state of the input field
- `showFooter`: Computed boolean derived from `isHovered || isInputFocused`

**Existing State:**
- `followUpText`: String containing the current input value (unchanged)

### Event Handling

**Mouse Events:**
- `onMouseEnter`: Set `isHovered` to true when mouse enters the card
- `onMouseLeave`: Set `isHovered` to false when mouse exits the card

**Focus Events:**
- `onFocus`: Set `isInputFocused` to true when input receives focus
- `onBlur`: Set `isInputFocused` to false when input loses focus

## Components and Interfaces

### Modified ConversationNode Component

**Props Interface (unchanged):**
```typescript
export interface ConversationNodeData extends Record<string, unknown> {
  question: string;
  response: string;
  timestamp: string;
  onAddFollowUp: (nodeId: string, question: string) => void;
}
```

**Component Signature:**
```typescript
export default function ConversationNode({ id, data }: NodeProps<any>)
```

### CSS Transition Strategy

**Height Transition:**
- Apply `transition-all` or specific `transition-[max-height]` to the Card component
- Use `max-height` property to animate between collapsed and expanded states
- Collapsed state: Calculate height without footer (content area only)
- Expanded state: Calculate height with footer (content area + footer height)

**Footer Content Transition:**
- Apply opacity transition to footer section
- Apply transform (translateY) for subtle slide-up effect
- Use `overflow-hidden` to clip content during collapse

**Timing:**
- Duration: 300ms (within 200-400ms requirement range)
- Easing: `ease-in-out` for smooth acceleration and deceleration
- Synchronize height and opacity transitions

## Data Models

No new data models are required. The component continues to use:
- `ConversationNodeData` interface for node data
- Local component state for UI interactions

## Implementation Details

### CSS Classes and Styling

**Card Container:**
- Add `transition-all duration-300 ease-in-out` for height animation
- Dynamically adjust height based on `showFooter` state
- Maintain existing width, border, and shadow styles

**Footer Section:**
- Wrap existing footer div in conditional rendering or use CSS classes
- Apply `transition-opacity duration-300 ease-in-out` and `transition-transform duration-300 ease-in-out`
- Hidden state: `opacity-0 translate-y-2 max-h-0`
- Visible state: `opacity-100 translate-y-0 max-h-[100px]`
- Use `overflow-hidden` to prevent content overflow during animation

**Content Area:**
- No changes to existing content area styling
- Maintain scrollable behavior for long content

### Height Calculation Strategy

**Option 1: Fixed Heights**
- Define explicit heights for collapsed and expanded states
- Collapsed: Remove footer height (~52px based on py-4 padding)
- Expanded: Include full footer height
- Simpler implementation but less flexible

**Option 2: Dynamic max-height**
- Use `max-height` with large value for expanded state
- Use calculated or estimated value for collapsed state
- More flexible but requires careful tuning

**Recommended Approach:** Option 1 with fixed heights for predictable animations

**Critical Spacing Requirement:**
- The card height increase must exactly match the footer section's visible height
- Footer has `py-4` padding (16px top + 16px bottom = 32px) plus input height (~36px) = ~68px total
- Card height difference should be ~68px, not 100px
- Alternatively, adjust footer max-height to match the card height difference exactly

### Interaction Flow

1. **Initial Render:**
   - `isHovered` = false, `isInputFocused` = false
   - `showFooter` = false
   - Footer is hidden, node is collapsed

2. **Mouse Hover:**
   - User hovers over card → `isHovered` = true
   - `showFooter` = true
   - Height expands with ease-in-out
   - Footer fades in and slides up

3. **Input Focus:**
   - User clicks input → `isInputFocused` = true
   - `showFooter` remains true even if mouse leaves
   - Footer stays visible during typing

4. **Submit or Blur:**
   - User submits or clicks away → `isInputFocused` = false
   - If mouse not hovering → `showFooter` = false
   - Height collapses with ease-in-out
   - Footer fades out and slides down

## Error Handling

### Edge Cases

1. **Rapid Hover On/Off:**
   - CSS transitions handle rapid state changes gracefully
   - No additional debouncing required

2. **Focus During Collapse:**
   - Focus event will immediately set `isInputFocused` = true
   - Animation will reverse smoothly

3. **Text Preservation:**
   - `followUpText` state persists across visibility changes
   - Input value is maintained in React state

4. **Long Content Scrolling:**
   - Existing scroll behavior in content area is unaffected
   - Footer animation is independent of content scroll state

### Accessibility Considerations

1. **Keyboard Navigation:**
   - Input remains focusable via Tab key even when hidden
   - Focus event triggers visibility, ensuring keyboard users can access

2. **Screen Readers:**
   - Footer section remains in DOM when hidden (opacity-based hiding)
   - Screen readers can still discover and announce the input field

3. **Reduced Motion:**
   - Consider adding `prefers-reduced-motion` media query support
   - Disable transitions for users who prefer reduced motion

## Testing Strategy

### Unit Testing

**State Management Tests:**
- Verify `isHovered` updates on mouse enter/leave
- Verify `isInputFocused` updates on focus/blur
- Verify `showFooter` computed correctly from both states

**Event Handler Tests:**
- Test mouse enter sets hover state
- Test mouse leave clears hover state
- Test input focus sets focus state
- Test input blur clears focus state

### Integration Testing

**Interaction Flow Tests:**
- Test hover shows footer
- Test hover away hides footer
- Test focus keeps footer visible after hover away
- Test blur hides footer when not hovering
- Test text preservation across visibility changes

### Visual Testing

**Animation Tests:**
- Verify smooth height transition (300ms ease-in-out)
- Verify footer opacity transition
- Verify footer transform (slide) transition
- Verify animations are synchronized

**Responsive Tests:**
- Test with short content
- Test with long scrollable content
- Test rapid hover on/off
- Test focus during collapse animation

### Manual Testing Checklist

- [ ] Footer hidden on initial render
- [ ] Footer appears smoothly on hover
- [ ] Footer disappears smoothly on hover away
- [ ] Footer stays visible when input focused
- [ ] Footer stays visible when typing
- [ ] Footer hides after submit (if not hovering)
- [ ] Footer hides after blur (if not hovering)
- [ ] Text preserved when footer hides/shows
- [ ] Animations feel smooth and natural
- [ ] No visual glitches during transitions
- [ ] Keyboard navigation works correctly
- [ ] Tab key can focus hidden input

## Design Decisions and Rationales

### Decision 1: Opacity + Transform vs Display None

**Choice:** Use opacity and transform transitions with `max-height` for hiding
**Rationale:** 
- Allows smooth CSS transitions (display: none is not animatable)
- Keeps element in DOM for accessibility
- Provides better user experience with fade and slide effects

### Decision 2: Combined Hover and Focus State

**Choice:** Use `showFooter = isHovered || isInputFocused`
**Rationale:**
- Prevents footer from disappearing while user is typing
- Maintains intuitive hover behavior when not focused
- Simple boolean logic, easy to understand and maintain

### Decision 3: 300ms Transition Duration

**Choice:** Use 300ms for all transitions
**Rationale:**
- Within required 200-400ms range
- Fast enough to feel responsive
- Slow enough to appear smooth and intentional
- Standard duration for UI micro-interactions

### Decision 4: Ease-in-out Timing Function

**Choice:** Use ease-in-out for all animations
**Rationale:**
- Meets requirement for ease-in and ease-out
- Creates natural acceleration and deceleration
- Feels more organic than linear transitions
- Standard for expand/collapse animations

### Decision 5: Fixed Height Approach

**Choice:** Use calculated fixed heights for collapsed/expanded states
**Rationale:**
- More predictable animation behavior
- Easier to debug and maintain
- Avoids max-height transition quirks
- Better performance than dynamic calculations

## Visual Design

### Animation Sequence Diagram

```
Hover On:
┌─────────────────────────────────────────┐
│  Content Area (visible)                 │
│  - Question                             │
│  - Response                             │
└─────────────────────────────────────────┘
              ↓ (300ms ease-in-out)
┌─────────────────────────────────────────┐
│  Content Area (visible)                 │
│  - Question                             │
│  - Response                             │
├─────────────────────────────────────────┤
│  Footer (fading in, sliding up)         │
│  - Input field                          │
│  - Send button                          │
└─────────────────────────────────────────┘

Hover Off (no focus):
┌─────────────────────────────────────────┐
│  Content Area (visible)                 │
│  - Question                             │
│  - Response                             │
├─────────────────────────────────────────┤
│  Footer (visible)                       │
│  - Input field                          │
│  - Send button                          │
└─────────────────────────────────────────┘
              ↓ (300ms ease-in-out)
┌─────────────────────────────────────────┐
│  Content Area (visible)                 │
│  - Question                             │
│  - Response                             │
└─────────────────────────────────────────┘
```

### CSS Transition Properties

```css
/* Card container */
.conversation-card {
  transition: max-height 300ms ease-in-out;
}

/* Footer section */
.footer-section {
  transition: opacity 300ms ease-in-out,
              transform 300ms ease-in-out,
              max-height 300ms ease-in-out;
}

/* Hidden state */
.footer-hidden {
  opacity: 0;
  transform: translateY(8px);
  max-height: 0;
  overflow: hidden;
}

/* Visible state */
.footer-visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 100px;
  overflow: visible;
}
```

## Performance Considerations

1. **CSS Transitions vs JavaScript Animations:**
   - Use CSS transitions for better performance
   - GPU-accelerated transform and opacity properties
   - No JavaScript animation loop overhead

2. **Reflow Minimization:**
   - Use transform instead of position changes
   - Use opacity instead of visibility for smoother transitions
   - Batch state updates to minimize re-renders

3. **React Rendering:**
   - State changes are localized to ConversationNode
   - No prop drilling or context updates required
   - Minimal re-render impact on parent components

## Future Enhancements

1. **Configurable Animation Duration:**
   - Allow users to customize transition speed
   - Add preferences for animation intensity

2. **Alternative Interaction Patterns:**
   - Click to toggle footer visibility
   - Keyboard shortcut to show footer

3. **Mobile Touch Support:**
   - Adapt hover behavior for touch devices
   - Consider tap-to-show pattern for mobile

4. **Animation Variants:**
   - Different animation styles (slide, fade, scale)
   - User preference for animation type
