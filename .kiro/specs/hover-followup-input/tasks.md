# Implementation Plan

- [x] 1. Add state management for hover and focus tracking
  - Add `isHovered` state variable using useState hook to track mouse hover state
  - Add `isInputFocused` state variable using useState hook to track input focus state
  - Compute `showFooter` as derived value from `isHovered || isInputFocused`
  - _Requirements: 1.1, 2.1, 2.3, 3.1, 3.2_

- [x] 2. Implement event handlers for hover and focus interactions
  - Add `onMouseEnter` handler to Card component that sets `isHovered` to true
  - Add `onMouseLeave` handler to Card component that sets `isHovered` to false
  - Add `onFocus` handler to Input component that sets `isInputFocused` to true
  - Add `onBlur` handler to Input component that sets `isInputFocused` to false
  - _Requirements: 2.1, 2.3, 2.4, 3.1, 3.2, 3.3, 4.4_

- [x] 3. Add CSS transitions for smooth animations
  - Add `transition-all duration-300 ease-in-out` classes to Card component for height animation
  - Add transition classes for opacity, transform, and max-height to footer section with 300ms duration and ease-in-out timing
  - Apply `overflow-hidden` to footer section to clip content during collapse
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 4. Implement conditional styling for footer visibility
  - Create conditional className logic for footer section based on `showFooter` state
  - Apply hidden state styles: `opacity-0`, `translate-y-2`, `max-h-0` when `showFooter` is false
  - Apply visible state styles: `opacity-100`, `translate-y-0`, `max-h-[100px]` when `showFooter` is true
  - Ensure footer section uses `overflow-hidden` to prevent content overflow during animation
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.4, 2.5, 4.3, 4.4, 4.6_

- [x] 5. Adjust Card height to accommodate footer visibility
  - Modify Card component height classes to dynamically adjust based on `showFooter` state
  - Calculate collapsed height (without footer) and expanded height (with footer)
  - Apply appropriate height classes conditionally using template literals
  - Ensure height transition is smooth and synchronized with footer content animation
  - _Requirements: 1.2, 2.1, 2.4, 4.1, 4.2, 4.6_

- [x] 6. Verify text preservation across visibility changes
  - Ensure `followUpText` state is maintained when footer transitions between visible and hidden
  - Verify input value persists correctly during hover on/off cycles
  - Test that text is preserved when input loses focus and footer collapses
  - _Requirements: 2.5, 3.1_

- [x] 7. Test interaction flows and edge cases
  - Test hover on shows footer with smooth animation
  - Test hover off hides footer with smooth animation
  - Test input focus keeps footer visible when mouse leaves
  - Test input blur hides footer when not hovering
  - Test rapid hover on/off transitions
  - Test focus during collapse animation
  - Verify keyboard navigation (Tab key) can focus input even when hidden
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 4.4_

- [x] 8. Fix spacing mismatch between card height change and footer section height
  - Measure the actual visible footer section height including padding and content
  - Adjust card height differences to exactly match the footer section visible height
  - Ensure the amount of space the card expands equals the amount of space the footer takes
  - Test that there are no gaps or overlaps when footer expands/collapses
  - _Requirements: 1.2, 2.1, 2.4, 4.6, 4.7_
