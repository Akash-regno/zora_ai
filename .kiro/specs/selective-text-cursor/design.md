# Design Document

## Overview

This design implements selective cursor behavior for the ConversationNode component that displays the text cursor (I-beam) only when hovering directly over text content, while maintaining the default pointer cursor over empty areas. The solution uses CSS cursor properties applied at the appropriate element levels, combined with proper handling of text selection events to prevent flickering when the mouse moves outside text boundaries during active selection. This approach ensures nodes are easily draggable while preserving robust text selection functionality.

## Architecture

### Component Structure

The ConversationNode component will be modified to:
1. Apply cursor styles at the text element level rather than container level
2. Remove cursor styling from parent containers to allow default cursor behavior
3. Maintain existing "select-text" and "nodrag" classes for proper interaction behavior
4. Ensure text selection remains stable during mouse movements outside text boundaries

### CSS Cursor Strategy

**Current Issue:**
- The "select-text" class applies `cursor: text` to the entire container div
- This makes the text cursor appear over empty padding and spacing areas
- When selecting text, moving the mouse outside the text area causes selection to flicker

**Solution Approach:**
- Apply `cursor: text` only to the actual text elements (spans, paragraphs, inline elements)
- Keep parent containers with default cursor behavior
- Use CSS `user-select: text` on text content to enable selection
- Ensure selection behavior is not interrupted by cursor position changes

## Components and Interfaces

### Modified ConversationNode Component

**No Props Changes Required:**
The existing `ConversationNodeData` interface remains unchanged.

### CSS Class Modifications

**Current Classes:**
```tsx
<div className="select-text nodrag">
  <div className="text-[15px] text-[#ececec] ...">
    {data.question}
  </div>
</div>
```

**Modified Approach:**
```tsx
<div className="nodrag">
  <div className="text-[15px] text-[#ececec] select-text cursor-text ...">
    {data.question}
  </div>
</div>
```

**Key Changes:**
1. Move "select-text" class from parent container to actual text element
2. Add explicit "cursor-text" class to text elements
3. Keep "nodrag" on parent to prevent dragging when clicking near text
4. Ensure parent container has default cursor behavior

## Implementation Details

### CSS Cursor Classes

**Define New Utility Classes (if not already available):**
```css
.cursor-text {
  cursor: text;
}

.cursor-default {
  cursor: default;
}
```

**Text Selection Classes:**
```css
.select-text {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.select-none {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}
```

### Element-Level Cursor Application

**Question Text Section:**
```tsx
<div className="nodrag">
  <div className="text-[15px] text-[#ececec] whitespace-pre-wrap break-words leading-relaxed select-text cursor-text">
    {data.question}
  </div>
</div>
```

**Response Text Section (with MarkdownContent):**
```tsx
<div className="nodrag">
  <MarkdownContent 
    content={data.response} 
    className="text-[15px] text-[#ececec] leading-relaxed select-text cursor-text" 
  />
</div>
```

### MarkdownContent Component Considerations

The MarkdownContent component renders markdown as HTML elements. We need to ensure:
1. The cursor-text class is applied to the root element
2. All rendered text elements inherit the text cursor
3. Selection behavior works across all markdown elements (paragraphs, lists, code blocks, etc.)

**Potential MarkdownContent Modification:**
If the className prop is passed to the root container, the cursor-text will apply to all child text elements automatically through CSS inheritance.

### Handling Text Selection Flickering

**Root Cause:**
When the mouse moves outside the text element during selection, the browser may interpret this as leaving the selectable area, causing the selection to be lost or flicker.

**Solution:**
1. Ensure `user-select: text` is applied to text elements
2. Keep parent containers with `user-select: none` to prevent accidental selection of empty areas
3. The browser's native text selection behavior should handle maintaining selection during drag operations
4. Do not interfere with mousedown/mousemove/mouseup events on text elements

**CSS Hierarchy:**
```css
/* Parent container - no selection */
.node-container {
  user-select: none;
  cursor: default;
}

/* Text content - selectable with text cursor */
.text-content {
  user-select: text;
  cursor: text;
}
```

This hierarchy ensures:
- Empty areas don't accidentally get selected
- Text areas are fully selectable
- Selection persists even when mouse moves outside during drag

## Data Models

No new data models are required. The component continues to use the existing `ConversationNodeData` interface.

## Error Handling

### Edge Cases

1. **Long Text Selection Across Multiple Lines:**
   - Native browser behavior handles multi-line selection
   - CSS user-select: text ensures selection works correctly
   - No special handling required

2. **Selection Starting Outside Text:**
   - If user starts selection in empty area, no text will be selected
   - This is expected behavior and prevents accidental selections

3. **Selection Ending Outside Text:**
   - Selection should persist up to the last text character
   - Browser native behavior handles this correctly with user-select: text

4. **Rapid Mouse Movement During Selection:**
   - CSS-based solution is performant and doesn't require JavaScript event handling
   - Browser handles selection tracking natively

### Browser Compatibility

**user-select Property:**
- Modern browsers: Fully supported
- Safari: Requires -webkit- prefix (included in solution)
- Firefox: Requires -moz- prefix (included in solution)
- IE/Edge: Requires -ms- prefix (included in solution)

**cursor Property:**
- Universally supported across all modern browsers
- No compatibility concerns

## Testing Strategy

### Visual Testing

**Cursor Behavior Tests:**
- [ ] Verify default cursor appears over empty padding areas
- [ ] Verify default cursor appears over spacing between question and response
- [ ] Verify text cursor appears when hovering directly over question text
- [ ] Verify text cursor appears when hovering directly over response text
- [ ] Verify text cursor appears over markdown-rendered content (paragraphs, lists, code)
- [ ] Verify cursor changes immediately when moving between text and empty areas

**Text Selection Tests:**
- [ ] Verify text can be selected by clicking and dragging over question
- [ ] Verify text can be selected by clicking and dragging over response
- [ ] Verify selection persists when mouse moves slightly outside text during drag
- [ ] Verify no flickering occurs when selecting text and moving mouse outside boundaries
- [ ] Verify double-click selects word
- [ ] Verify triple-click selects paragraph/line
- [ ] Verify selection works across multiple lines
- [ ] Verify selection works in markdown content (code blocks, lists, etc.)

**Node Dragging Tests:**
- [ ] Verify node can be dragged by clicking on empty padding areas
- [ ] Verify node can be dragged by clicking on spacing between elements
- [ ] Verify node cannot be dragged when clicking and dragging over text (text selection takes precedence)
- [ ] Verify dragging works smoothly without interference from cursor changes

### Integration Testing

**Interaction Flow Tests:**
- Test cursor changes when moving mouse from outside node to text
- Test cursor changes when moving mouse from text to empty area
- Test text selection followed by node dragging
- Test node dragging followed by text selection
- Test rapid switching between text and empty areas

### Manual Testing Checklist

- [ ] Hover over various parts of the node and verify cursor appearance
- [ ] Select text from beginning to end of question
- [ ] Select text from beginning to end of response
- [ ] Select text and drag mouse outside text area - verify no flickering
- [ ] Select text across multiple lines
- [ ] Double-click to select word
- [ ] Triple-click to select paragraph
- [ ] Drag node by clicking on padding areas
- [ ] Drag node by clicking on spacing between elements
- [ ] Verify markdown content (if present) shows text cursor over text
- [ ] Test with long content that requires scrolling
- [ ] Test with short content

## Design Decisions and Rationales

### Decision 1: CSS-Only Solution vs JavaScript Event Handling

**Choice:** Use CSS cursor and user-select properties exclusively
**Rationale:**
- CSS solutions are more performant (no JavaScript event listeners)
- Browser native text selection is robust and well-tested
- Simpler implementation with less code
- No risk of event handler conflicts with React Flow dragging
- Automatic browser compatibility handling for selection behavior

### Decision 2: Element-Level Cursor Application

**Choice:** Apply cursor: text to text elements, not parent containers
**Rationale:**
- Provides precise control over cursor appearance
- Prevents text cursor from appearing over empty areas
- Maintains clear visual feedback for where text can be selected
- Allows default cursor over padding for easier node dragging

### Decision 3: Maintain "nodrag" on Parent Containers

**Choice:** Keep "nodrag" class on parent divs wrapping text content
**Rationale:**
- Prevents accidental node dragging when clicking near text
- Ensures text selection takes precedence over dragging in text areas
- Maintains existing behavior that users expect
- Provides clear interaction zones (text for selection, empty areas for dragging)

### Decision 4: user-select Hierarchy

**Choice:** Apply user-select: none to node container, user-select: text to text elements
**Rationale:**
- Prevents accidental selection of empty areas and UI elements
- Ensures only intended text content is selectable
- Reduces confusion about what can be selected
- Improves overall interaction clarity

### Decision 5: No JavaScript Selection Tracking

**Choice:** Rely on browser native selection behavior, no custom selection tracking
**Rationale:**
- Browser native selection is highly optimized and reliable
- Custom selection tracking would add complexity and potential bugs
- Native behavior handles edge cases (multi-line, word boundaries, etc.) correctly
- Reduces maintenance burden and code complexity
- Better performance without additional event listeners

## Visual Design

### Cursor Behavior Diagram

```
┌─────────────────────────────────────────┐
│  [Empty Padding - Default Cursor]      │
│  ┌───────────────────────────────────┐ │
│  │ Question Text - Text Cursor       │ │
│  │ Multiple lines of text...         │ │
│  └───────────────────────────────────┘ │
│  [Empty Spacing - Default Cursor]      │
│  ─────────────────────────────────────  │
│  [Empty Spacing - Default Cursor]      │
│  ┌───────────────────────────────────┐ │
│  │ Response Text - Text Cursor       │ │
│  │ Multiple lines of markdown...     │ │
│  └───────────────────────────────────┘ │
│  [Empty Padding - Default Cursor]      │
└─────────────────────────────────────────┘
```

### Text Selection Behavior

```
User Action: Click and drag from start to end of text
┌─────────────────────────────────────────┐
│  Question Text                          │
│  [████████████████████████████]         │
│  Selected text remains highlighted      │
└─────────────────────────────────────────┘
         ↓ Mouse moves outside
┌─────────────────────────────────────────┐
│  Question Text                          │
│  [████████████████████████████]         │
│  Selection persists, no flickering   ← Mouse
└─────────────────────────────────────────┘
```

## Performance Considerations

1. **CSS vs JavaScript:**
   - CSS cursor changes are handled by the browser's rendering engine
   - No JavaScript overhead for cursor updates
   - No event listeners required for cursor behavior

2. **Text Selection:**
   - Browser native selection is highly optimized
   - No custom selection tracking overhead
   - No additional re-renders triggered by selection changes

3. **React Rendering:**
   - No state changes required for cursor behavior
   - No props changes required
   - Minimal impact on component rendering performance

## Accessibility Considerations

1. **Keyboard Navigation:**
   - Text selection via keyboard (Shift + Arrow keys) works natively
   - No changes to keyboard interaction behavior

2. **Screen Readers:**
   - Text content remains fully accessible to screen readers
   - user-select: text does not affect screen reader behavior
   - All text content is announced correctly

3. **Visual Indicators:**
   - Cursor changes provide clear visual feedback
   - Text selection highlighting works as expected
   - No accessibility barriers introduced

## Future Enhancements

1. **Custom Cursor Styles:**
   - Add custom cursor images for different interaction zones
   - Provide visual hints for draggable areas

2. **Selection Highlighting:**
   - Custom selection colors to match theme
   - Enhanced visual feedback for selected text

3. **Touch Device Support:**
   - Adapt selection behavior for touch screens
   - Long-press to select text on mobile devices

4. **Accessibility Improvements:**
   - High contrast mode support for cursor visibility
   - Enhanced keyboard selection shortcuts
