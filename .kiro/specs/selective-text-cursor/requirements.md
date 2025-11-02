# Requirements Document

## Introduction

This feature enhances the user experience of conversation nodes by implementing selective cursor behavior that only displays the text cursor (I-beam) when hovering directly over text content, while maintaining the default cursor over empty areas. Currently, there are two issues: (1) the entire node box shows a text cursor when hovering over selectable text areas, which makes it difficult for users to drag and reposition nodes on the canvas, and (2) when selecting text, if the mouse cursor moves slightly outside the text area during selection, the selected text flickers and becomes unselected. This feature will restrict the text cursor to appear only when positioned directly over actual text content, while ensuring that text selection remains stable even when the mouse moves outside the text boundaries during an active selection operation.

## Glossary

- **ConversationNode**: The React component that displays a question-response pair in a card format with an input field for asking followup questions
- **Node Box**: The visible card container that holds the conversation content and followup input
- **Text Cursor**: The I-beam cursor that indicates text can be selected (CSS cursor: text)
- **Default Cursor**: The standard arrow pointer cursor (CSS cursor: default or auto)
- **Text Content Area**: The regions within the node containing the question text and response text that users can select
- **Empty Area**: The regions within the node that do not contain text, such as padding, margins, and spacing between elements
- **Selectable Text**: Text content marked with the "select-text" class that allows user selection

## Requirements

### Requirement 1

**User Story:** As a user viewing the conversation canvas, I want the cursor to remain as the default pointer when hovering over empty areas of the node box, so that I can easily identify where I can click to drag and move nodes

#### Acceptance Criteria

1. WHEN the user positions their mouse cursor over empty areas within the node box, THE ConversationNode SHALL display the default pointer cursor
2. WHEN the user positions their mouse cursor over padding areas within the node box, THE ConversationNode SHALL display the default pointer cursor
3. WHEN the user positions their mouse cursor over spacing between text elements, THE ConversationNode SHALL display the default pointer cursor
4. THE ConversationNode SHALL not apply the text cursor to the entire selectable text container

### Requirement 2

**User Story:** As a user reading conversation content, I want the cursor to change to a text cursor only when hovering directly over text, so that I know exactly where I can select and copy text

#### Acceptance Criteria

1. WHEN the user positions their mouse cursor directly over the question text content, THE ConversationNode SHALL display the text cursor (I-beam)
2. WHEN the user positions their mouse cursor directly over the response text content, THE ConversationNode SHALL display the text cursor (I-beam)
3. WHEN the user positions their mouse cursor directly over markdown-rendered text in the response, THE ConversationNode SHALL display the text cursor (I-beam)
4. THE ConversationNode SHALL apply the text cursor only to the actual text elements, not their parent containers

### Requirement 3

**User Story:** As a user interacting with nodes on the canvas, I want to be able to drag nodes easily by clicking on empty areas, so that I can organize my conversation flow efficiently

#### Acceptance Criteria

1. WHEN the user clicks and drags on empty areas of the node box, THE ConversationNode SHALL allow the node to be moved on the canvas
2. WHEN the user clicks and drags on padding areas of the node box, THE ConversationNode SHALL allow the node to be moved on the canvas
3. THE ConversationNode SHALL maintain the "nodrag" class on text content areas to prevent accidental dragging when selecting text
4. THE ConversationNode SHALL ensure that empty areas do not have the "nodrag" class applied

### Requirement 4

**User Story:** As a user selecting text within nodes, I want to be able to select and copy text content normally without the selection flickering or being lost, so that I can extract information from conversations reliably

#### Acceptance Criteria

1. WHEN the user clicks and drags over text content, THE ConversationNode SHALL allow text selection
2. WHEN the user double-clicks on text content, THE ConversationNode SHALL select the word under the cursor
3. WHEN the user triple-clicks on text content, THE ConversationNode SHALL select the entire paragraph or line
4. WHILE the user is actively selecting text (mouse button held down), THE ConversationNode SHALL maintain the text selection even if the mouse cursor moves outside the text content boundaries
5. WHEN the user drags the mouse cursor outside the text area during an active selection, THE ConversationNode SHALL not cause the selection to flicker or become unselected
6. WHEN the user releases the mouse button after selecting text, THE ConversationNode SHALL preserve the selected text regardless of final cursor position
7. THE ConversationNode SHALL preserve all existing text selection functionality
8. THE ConversationNode SHALL maintain the "select-text" class behavior for text content areas

### Requirement 5

**User Story:** As a user navigating between text and empty areas, I want the cursor to change smoothly and immediately, so that the interface feels responsive and polished

#### Acceptance Criteria

1. WHEN the user moves their mouse cursor from empty area to text content, THE ConversationNode SHALL change the cursor to text cursor within 50ms
2. WHEN the user moves their mouse cursor from text content to empty area, THE ConversationNode SHALL change the cursor to default pointer within 50ms
3. THE ConversationNode SHALL apply cursor changes without any visual lag or delay
4. THE ConversationNode SHALL ensure cursor changes are handled by CSS for optimal performance
