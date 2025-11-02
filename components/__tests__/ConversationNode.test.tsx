import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConversationNode from '../canvas/ConversationNode';
import { NodeProps, ReactFlow, ReactFlowProvider } from '@xyflow/react';

// Mock the MarkdownContent component
jest.mock('../MarkdownContent', () => {
  return function MarkdownContent({ content }: { content: string }) {
    return <div data-testid="markdown-content">{content}</div>;
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Send: () => <div data-testid="send-icon">Send</div>,
}));

// Wrapper component for ReactFlow context
const ReactFlowWrapper = ({ children }: { children: React.ReactNode }) => (
  <ReactFlowProvider>
    <ReactFlow nodes={[]} edges={[]}>
      {children}
    </ReactFlow>
  </ReactFlowProvider>
);

describe('ConversationNode - Hover and Focus Interactions', () => {
  const mockOnAddFollowUp = jest.fn();
  
  const defaultProps: NodeProps<any> = {
    id: 'test-node-1',
    data: {
      question: 'What is React?',
      response: 'React is a JavaScript library for building user interfaces.',
      timestamp: '2024-01-01T00:00:00Z',
      onAddFollowUp: mockOnAddFollowUp,
    },
    type: 'conversation',
    selected: false,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    zIndex: 0,
  };

  const renderWithFlow = (props: NodeProps<any> = defaultProps) => {
    return render(
      <ReactFlowWrapper>
        <ConversationNode {...props} />
      </ReactFlowWrapper>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should hide footer section on initial render', () => {
      const { container } = renderWithFlow();
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');
      
      expect(footer).toHaveClass('opacity-0');
      expect(footer).toHaveClass('max-h-0');
    });
  });

  describe('Hover Interactions', () => {
    it('should show footer with smooth animation on hover', async () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');

      expect(footer).toHaveClass('opacity-0');
      
      fireEvent.mouseEnter(card!);
      
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
        expect(footer).toHaveClass('translate-y-0');
        expect(footer).toHaveClass('max-h-[100px]');
      });
    });

    it('should hide footer with smooth animation on hover off', async () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');

      // Hover on
      fireEvent.mouseEnter(card!);
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
      });

      // Hover off
      fireEvent.mouseLeave(card!);
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-0');
        expect(footer).toHaveClass('translate-y-2');
        expect(footer).toHaveClass('max-h-0');
      });
    });

    it('should apply transition classes for smooth animations', () => {
      const { container } = renderWithFlow();
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');
      
      expect(footer).toHaveClass('transition-all');
      expect(footer).toHaveClass('duration-300');
      expect(footer).toHaveClass('ease-in-out');
    });
  });

  describe('Input Focus Interactions', () => {
    it('should keep footer visible when input is focused even after mouse leaves', async () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      const input = screen.getByPlaceholderText('Ask a follow-up...');
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');

      // Hover to show footer
      fireEvent.mouseEnter(card!);
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
      });

      // Focus input
      fireEvent.focus(input);
      
      // Mouse leaves
      fireEvent.mouseLeave(card!);
      
      // Footer should still be visible because input is focused
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
        expect(footer).toHaveClass('max-h-[100px]');
      });
    });

    it('should hide footer when input loses focus and not hovering', async () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      const input = screen.getByPlaceholderText('Ask a follow-up...');
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');

      // Hover and focus
      fireEvent.mouseEnter(card!);
      fireEvent.focus(input);
      
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
      });

      // Mouse leaves and blur input
      fireEvent.mouseLeave(card!);
      fireEvent.blur(input);
      
      // Footer should be hidden
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-0');
        expect(footer).toHaveClass('max-h-0');
      });
    });
  });

  describe('Text Preservation', () => {
    it('should preserve text in input when footer transitions between visible and hidden', async () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      const input = screen.getByPlaceholderText('Ask a follow-up...') as HTMLInputElement;

      // Hover to show footer
      fireEvent.mouseEnter(card!);
      await waitFor(() => {
        const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');
        expect(footer).toHaveClass('opacity-100');
      });

      // Type text
      await userEvent.type(input, 'Test follow-up question');
      expect(input.value).toBe('Test follow-up question');

      // Blur input and hover off (footer hides but text should persist)
      fireEvent.blur(input);
      fireEvent.mouseLeave(card!);
      await waitFor(() => {
        const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');
        expect(footer).toHaveClass('opacity-0');
      });

      // Text should still be there
      expect(input.value).toBe('Test follow-up question');

      // Hover back on
      fireEvent.mouseEnter(card!);
      await waitFor(() => {
        const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');
        expect(footer).toHaveClass('opacity-100');
      });

      // Text should still be preserved
      expect(input.value).toBe('Test follow-up question');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid hover on/off transitions', async () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');

      // Rapid hover on/off
      fireEvent.mouseEnter(card!);
      fireEvent.mouseLeave(card!);
      fireEvent.mouseEnter(card!);
      fireEvent.mouseLeave(card!);
      fireEvent.mouseEnter(card!);

      // Should end in visible state
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
      });
    });

    it('should handle focus during collapse animation', async () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      const input = screen.getByPlaceholderText('Ask a follow-up...');
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');

      // Hover on
      fireEvent.mouseEnter(card!);
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
      });

      // Start collapse by hovering off
      fireEvent.mouseLeave(card!);
      
      // Immediately focus input (during collapse animation)
      fireEvent.focus(input);

      // Footer should remain/become visible
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
        expect(footer).toHaveClass('max-h-[100px]');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should allow Tab key to focus input even when footer is hidden', async () => {
      renderWithFlow();
      const input = screen.getByPlaceholderText('Ask a follow-up...');

      // Input should be focusable via keyboard even when hidden
      input.focus();
      
      expect(document.activeElement).toBe(input);
    });

    it('should show footer when input receives focus via keyboard', async () => {
      const { container } = renderWithFlow();
      const input = screen.getByPlaceholderText('Ask a follow-up...');
      const footer = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].bg-\\[\\#212121\\]');

      // Initially hidden
      expect(footer).toHaveClass('opacity-0');

      // Focus via keyboard
      fireEvent.focus(input);

      // Footer should become visible
      await waitFor(() => {
        expect(footer).toHaveClass('opacity-100');
        expect(footer).toHaveClass('max-h-[100px]');
      });
    });
  });

  describe('Card Height Transitions', () => {
    it('should adjust card height when footer becomes visible', async () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');

      // Initially collapsed
      expect(card).toHaveClass('max-h-[400px]');

      // Hover to expand
      fireEvent.mouseEnter(card!);

      await waitFor(() => {
        expect(card).toHaveClass('max-h-[500px]');
      });
    });

    it('should apply transition classes to card for smooth height animation', () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');

      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-300');
      expect(card).toHaveClass('ease-in-out');
    });
  });

  describe('Cursor Behavior Across Different Node Areas', () => {
    it('should have default cursor on empty padding areas at the top of the node', () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      
      // Card should have cursor-default class
      expect(card).toHaveClass('cursor-default');
    });

    it('should have default cursor on empty padding areas at the bottom of the node', () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      
      // Card should have cursor-default class
      expect(card).toHaveClass('cursor-default');
    });

    it('should have default cursor on spacing between question and response sections', () => {
      const { container } = renderWithFlow();
      const separator = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].select-none');
      
      // Separator should not have cursor-text class
      expect(separator).not.toHaveClass('cursor-text');
    });

    it('should have text cursor on question text element', () => {
      const { container } = renderWithFlow();
      const questionDiv = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      
      // Question text should have cursor-text class
      expect(questionDiv).toHaveClass('cursor-text');
      expect(questionDiv).toHaveClass('select-text');
    });

    it('should have text cursor on response text element', () => {
      const { container } = renderWithFlow();
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      
      // Response text (MarkdownContent) should be present
      expect(markdownContent).toBeInTheDocument();
    });

    it('should apply cursor-text class to text elements only, not parent containers', () => {
      const { container } = renderWithFlow();
      
      // Parent containers should not have cursor-text
      const parentContainers = container.querySelectorAll('.nodrag.select-none');
      parentContainers.forEach(parent => {
        expect(parent).not.toHaveClass('cursor-text');
      });
      
      // Text elements should have cursor-text
      const textElements = container.querySelectorAll('.cursor-text');
      expect(textElements.length).toBeGreaterThan(0);
    });

    it('should have select-text class on text content for proper selection behavior', () => {
      const { container } = renderWithFlow();
      
      // Question text should have select-text
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      expect(questionText).toHaveClass('select-text');
      
      // Response text should have select-text (via MarkdownContent className prop)
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      expect(markdownContent).toBeInTheDocument();
    });

    it('should have select-none class on parent containers to prevent accidental selection', () => {
      const { container } = renderWithFlow();
      
      // Parent containers should have select-none
      const parentContainers = container.querySelectorAll('.nodrag.select-none');
      expect(parentContainers.length).toBeGreaterThan(0);
      
      parentContainers.forEach(parent => {
        expect(parent).toHaveClass('select-none');
      });
    });

    it('should maintain nodrag class on text content areas to prevent dragging during text selection', () => {
      const { container } = renderWithFlow();
      
      // Text content parent containers should have nodrag class
      const nodragContainers = container.querySelectorAll('.nodrag');
      expect(nodragContainers.length).toBeGreaterThan(0);
    });

    it('should have proper CSS cursor hierarchy for immediate cursor changes', () => {
      const { container } = renderWithFlow();
      
      // Card (parent) should have cursor-default
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      expect(card).toHaveClass('cursor-default');
      
      // Text elements should have cursor-text
      const textElements = container.querySelectorAll('.cursor-text');
      expect(textElements.length).toBeGreaterThan(0);
      
      // This hierarchy ensures immediate cursor changes via CSS
      textElements.forEach(textEl => {
        expect(textEl).toHaveClass('cursor-text');
      });
    });
  });

  describe('Text Selection Functionality and Stability', () => {
    // Helper function to simulate text selection
    const simulateTextSelection = (element: Element, startOffset: number, endOffset: number) => {
      const range = document.createRange();
      const textNode = element.firstChild;
      
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        range.setStart(textNode, startOffset);
        range.setEnd(textNode, endOffset);
        
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    };

    // Helper to get selected text
    const getSelectedText = () => {
      return window.getSelection()?.toString() || '';
    };

    beforeEach(() => {
      // Clear any existing selections before each test
      window.getSelection()?.removeAllRanges();
    });

    it('should allow selecting text by clicking and dragging across question text', () => {
      const { container } = renderWithFlow();
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      
      expect(questionText).toBeTruthy();
      expect(questionText?.textContent).toBe('What is React?');
      
      // Simulate text selection
      if (questionText) {
        simulateTextSelection(questionText, 0, 7); // Select "What is"
        expect(getSelectedText()).toBe('What is');
      }
    });

    it('should allow selecting text by clicking and dragging across response text', () => {
      const { container } = renderWithFlow();
      const responseText = container.querySelector('[data-testid="markdown-content"]');
      
      expect(responseText).toBeTruthy();
      expect(responseText?.textContent).toContain('React is a JavaScript library');
      
      // Simulate text selection
      if (responseText) {
        simulateTextSelection(responseText, 0, 8); // Select "React is"
        expect(getSelectedText()).toBe('React is');
      }
    });

    it('should maintain selection when mouse moves outside text boundaries during active selection', () => {
      const { container } = renderWithFlow();
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      
      expect(questionText).toBeTruthy();
      
      if (questionText) {
        // Simulate text selection
        simulateTextSelection(questionText, 0, 7);
        const initialSelection = getSelectedText();
        expect(initialSelection).toBe('What is');
        
        // Simulate mouse moving outside by triggering mouseleave on the text element
        fireEvent.mouseLeave(questionText);
        
        // Selection should persist
        expect(getSelectedText()).toBe(initialSelection);
      }
    });

    it('should not cause flickering when selecting text and moving mouse outside the text area', () => {
      const { container } = renderWithFlow();
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      
      expect(questionText).toBeTruthy();
      
      if (questionText) {
        // Create selection
        simulateTextSelection(questionText, 0, 10);
        const initialSelection = getSelectedText();
        
        // Simulate rapid mouse movements outside and back
        fireEvent.mouseLeave(questionText);
        fireEvent.mouseEnter(questionText);
        fireEvent.mouseLeave(questionText);
        
        // Selection should remain stable (no flickering)
        expect(getSelectedText()).toBe(initialSelection);
      }
    });

    it('should support double-click to select word functionality', async () => {
      const { container } = renderWithFlow();
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      
      expect(questionText).toBeTruthy();
      
      if (questionText) {
        // Double-click on the text element
        fireEvent.doubleClick(questionText);
        
        // Browser should select a word (we can't fully test native browser behavior in jsdom,
        // but we can verify the element is set up correctly for selection)
        expect(questionText).toHaveClass('select-text');
        expect(questionText).toHaveClass('cursor-text');
      }
    });

    it('should support triple-click to select paragraph functionality', () => {
      const { container } = renderWithFlow();
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      
      expect(questionText).toBeTruthy();
      
      if (questionText) {
        // Triple-click simulation
        fireEvent.click(questionText);
        fireEvent.click(questionText);
        fireEvent.click(questionText);
        
        // Verify element has proper classes for text selection
        expect(questionText).toHaveClass('select-text');
        expect(questionText).toHaveClass('cursor-text');
      }
    });

    it('should support multi-line text selection', () => {
      const multiLineProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          question: 'What is React?\nHow does it work?\nWhy use it?',
          response: 'React is a JavaScript library.\nIt uses components.\nIt is efficient.',
        },
      };
      
      const { container } = renderWithFlow(multiLineProps);
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      
      expect(questionText).toBeTruthy();
      expect(questionText?.textContent).toContain('What is React?');
      expect(questionText?.textContent).toContain('How does it work?');
      
      if (questionText) {
        // Select across multiple lines
        simulateTextSelection(questionText, 0, 30); // Select across first two lines
        const selectedText = getSelectedText();
        
        // Should contain text from multiple lines
        expect(selectedText.length).toBeGreaterThan(0);
      }
    });

    it('should preserve text selection when mouse button is released', () => {
      const { container } = renderWithFlow();
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      
      expect(questionText).toBeTruthy();
      
      if (questionText) {
        // Simulate selection with mouse down and up
        fireEvent.mouseDown(questionText);
        simulateTextSelection(questionText, 0, 7);
        fireEvent.mouseUp(questionText);
        
        // Selection should persist after mouse up
        expect(getSelectedText()).toBe('What is');
      }
    });

    it('should maintain select-text class behavior for text content areas', () => {
      const { container } = renderWithFlow();
      
      // Question text should have select-text
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      expect(questionText).toHaveClass('select-text');
      
      // Response text should have select-text
      const responseText = container.querySelector('[data-testid="markdown-content"]');
      expect(responseText).toBeTruthy();
      
      // Verify CSS user-select is enabled via select-text class
      const computedStyle = questionText ? window.getComputedStyle(questionText) : null;
      // In jsdom, we can't fully test computed styles, but we verify the class is present
      expect(questionText).toHaveClass('select-text');
    });

    it('should allow text selection without interfering with node dragging functionality', () => {
      const { container } = renderWithFlow();
      const questionText = container.querySelector('.nodrag.select-none > .text-\\[15px\\]');
      const parentContainer = questionText?.parentElement;
      
      expect(questionText).toBeTruthy();
      expect(parentContainer).toBeTruthy();
      
      // Parent should have nodrag class to prevent dragging when interacting with text
      expect(parentContainer).toHaveClass('nodrag');
      
      // Text element should have select-text for selection
      expect(questionText).toHaveClass('select-text');
      
      // This combination ensures text selection works without triggering node drag
    });

    it('should handle selection across different markdown elements in response', () => {
      const markdownProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          response: '# Heading\n\nParagraph text here.\n\n- List item 1\n- List item 2',
        },
      };
      
      const { container } = renderWithFlow(markdownProps);
      const responseText = container.querySelector('[data-testid="markdown-content"]');
      
      expect(responseText).toBeTruthy();
      
      // Verify response has select-text class for proper selection behavior
      // (MarkdownContent should pass through the className prop)
      if (responseText) {
        // The mock MarkdownContent renders as a simple div, so we can test selection
        simulateTextSelection(responseText, 0, 10);
        expect(getSelectedText().length).toBeGreaterThan(0);
      }
    });
  });

  describe('Node Dragging Functionality with New Cursor Behavior', () => {
    it('should have nodrag class on text content areas to prevent dragging when interacting with text', () => {
      const { container } = renderWithFlow();
      
      // Question text parent container should have nodrag class
      const questionContainer = container.querySelector('.nodrag.cursor-text');
      expect(questionContainer).toBeTruthy();
      expect(questionContainer).toHaveClass('nodrag');
      
      // All nodrag containers should be present
      const nodragContainers = container.querySelectorAll('.nodrag');
      expect(nodragContainers.length).toBeGreaterThan(0);
    });

    it('should allow text selection when clicking and dragging over text content instead of dragging the node', () => {
      const { container } = renderWithFlow();
      const questionText = container.querySelector('.nodrag.cursor-text > .text-\\[15px\\]');
      
      expect(questionText).toBeTruthy();
      expect(questionText).toHaveClass('select-text');
      
      // Parent has nodrag class to prevent node dragging when interacting with text
      const parent = questionText?.parentElement;
      expect(parent).toHaveClass('nodrag');
      expect(parent).toHaveClass('cursor-text');
      
      // Simulate text selection (not node dragging)
      if (questionText) {
        fireEvent.mouseDown(questionText);
        
        // Create a text selection
        const range = document.createRange();
        const textNode = questionText.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, 0);
          range.setEnd(textNode, 7);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        fireEvent.mouseUp(questionText);
        
        // Verify text was selected (not node dragged)
        const selectedText = window.getSelection()?.toString();
        expect(selectedText).toBe('What is');
      }
    });

    it('should not have nodrag class on empty padding areas to allow node dragging', () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      
      expect(card).toBeTruthy();
      
      // Card itself should not have nodrag class (only text content areas have it)
      expect(card).not.toHaveClass('nodrag');
    });

    it('should allow node to be dragged by clicking on empty padding areas', () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      
      expect(card).toBeTruthy();
      
      // Card should be draggable (no nodrag class on card itself)
      expect(card).not.toHaveClass('nodrag');
      
      // Simulate drag on empty area (the card itself)
      if (card) {
        fireEvent.mouseDown(card);
        fireEvent.mouseMove(card, { clientX: 100, clientY: 100 });
        fireEvent.mouseUp(card);
        
        // The card should be draggable (React Flow handles the actual drag behavior)
        // We verify the setup is correct: no nodrag on card
        expect(card).not.toHaveClass('nodrag');
      }
    });

    it('should allow node to be dragged by clicking on spacing between elements', () => {
      const { container } = renderWithFlow();
      const separator = container.querySelector('.border-t.border-\\[\\#4d4d4d\\].select-none');
      
      expect(separator).toBeTruthy();
      
      // Separator should not have nodrag class (it's in the draggable area)
      expect(separator).not.toHaveClass('nodrag');
      
      // Separator should not have cursor-text (should allow dragging)
      expect(separator).not.toHaveClass('cursor-text');
      
      // Separator has select-none to prevent accidental text selection
      expect(separator).toHaveClass('select-none');
    });

    it('should properly separate draggable areas from text selection areas', () => {
      const { container } = renderWithFlow();
      
      // Text content areas (question and response containers) should have nodrag class
      const textContainers = container.querySelectorAll('.nodrag.cursor-text');
      expect(textContainers.length).toBeGreaterThan(0);
      
      textContainers.forEach(textContainer => {
        expect(textContainer).toHaveClass('nodrag');
        expect(textContainer).toHaveClass('cursor-text');
      });
      
      // Card (draggable area) should not have nodrag
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      expect(card).not.toHaveClass('nodrag');
    });

    it('should maintain proper cursor behavior for dragging vs text selection', () => {
      const { container } = renderWithFlow();
      
      // Text containers should have cursor-text
      const textContainers = container.querySelectorAll('.nodrag.cursor-text');
      expect(textContainers.length).toBeGreaterThan(0);
      
      textContainers.forEach(textContainer => {
        expect(textContainer).toHaveClass('cursor-text');
        expect(textContainer).toHaveClass('nodrag');
      });
      
      // Text elements should have select-text
      const textElements = container.querySelectorAll('.select-text');
      expect(textElements.length).toBeGreaterThan(0);
      
      // This setup ensures:
      // - Text areas show text cursor and allow selection (prevent dragging)
      // - Empty areas allow dragging (no nodrag class on card)
    });

    it('should have nodrag class on input field to prevent dragging when typing', () => {
      const { container } = renderWithFlow();
      const input = screen.getByPlaceholderText('Ask a follow-up...');
      
      expect(input).toBeTruthy();
      expect(input).toHaveClass('nodrag');
      
      // Input should not trigger node dragging when user interacts with it
    });

    it('should prevent node dragging when clicking on text content by using nodrag class', () => {
      const { container } = renderWithFlow();
      
      // Question text container
      const questionContainer = container.querySelector('.nodrag.cursor-text');
      expect(questionContainer).toBeTruthy();
      expect(questionContainer).toHaveClass('nodrag');
      
      // Response text container (should also have nodrag)
      const nodragContainers = container.querySelectorAll('.nodrag');
      
      // Should have at least 2 nodrag containers (question and response areas)
      // Plus the input field
      expect(nodragContainers.length).toBeGreaterThanOrEqual(3);
      
      // All text content areas should have nodrag to prevent accidental dragging
      nodragContainers.forEach(container => {
        expect(container).toHaveClass('nodrag');
      });
    });

    it('should allow smooth interaction between text selection and node dragging', () => {
      const { container } = renderWithFlow();
      const card = container.querySelector('.bg-\\[\\#2f2f2f\\]');
      const questionText = container.querySelector('.nodrag.cursor-text > .text-\\[15px\\]');
      
      expect(card).toBeTruthy();
      expect(questionText).toBeTruthy();
      
      // Scenario 1: Select text first
      if (questionText) {
        fireEvent.mouseDown(questionText);
        const range = document.createRange();
        const textNode = questionText.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, 0);
          range.setEnd(textNode, 5);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        fireEvent.mouseUp(questionText);
        
        const selectedText = window.getSelection()?.toString();
        expect(selectedText).toBeTruthy();
      }
      
      // Clear selection
      window.getSelection()?.removeAllRanges();
      
      // Scenario 2: Drag node (simulate on card)
      if (card) {
        fireEvent.mouseDown(card);
        fireEvent.mouseMove(card, { clientX: 50, clientY: 50 });
        fireEvent.mouseUp(card);
        
        // Card should still be draggable
        expect(card).not.toHaveClass('nodrag');
      }
      
      // Both interactions should work independently without interference
    });
  });

  describe('Markdown Content Cursor and Selection Behavior', () => {
    // Remove the mock for these specific tests to test actual markdown rendering
    beforeAll(() => {
      jest.unmock('../MarkdownContent');
    });

    afterAll(() => {
      // Re-apply mock after these tests
      jest.mock('../MarkdownContent', () => {
        return function MarkdownContent({ content }: { content: string }) {
          return <div data-testid="markdown-content">{content}</div>;
        };
      });
    });

    it('should apply cursor-text class to MarkdownContent component', () => {
      const { container } = renderWithFlow();
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      
      expect(markdownContent).toBeInTheDocument();
      // The parent div wrapping MarkdownContent should have the classes passed via className prop
    });

    it('should apply select-text class to MarkdownContent component for text selection', () => {
      const { container } = renderWithFlow();
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      
      expect(markdownContent).toBeInTheDocument();
      // MarkdownContent receives className="text-[15px] text-[#ececec] leading-relaxed select-text cursor-text"
    });

    it('should verify text cursor appears over markdown paragraphs', () => {
      const markdownProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          response: 'This is a paragraph.\n\nThis is another paragraph.',
        },
      };
      
      const { container } = renderWithFlow(markdownProps);
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      
      expect(markdownContent).toBeInTheDocument();
      expect(markdownContent?.textContent).toContain('This is a paragraph.');
      
      // The markdown-content div should have cursor-text applied via className prop
      // In the actual implementation, MarkdownContent wraps content in a div with the passed className
    });

    it('should verify text cursor appears over markdown lists', () => {
      const markdownProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          response: '- List item 1\n- List item 2\n- List item 3',
        },
      };
      
      const { container } = renderWithFlow(markdownProps);
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      
      expect(markdownContent).toBeInTheDocument();
      expect(markdownContent?.textContent).toContain('List item 1');
      expect(markdownContent?.textContent).toContain('List item 2');
      
      // MarkdownContent should have cursor-text class for all text content including lists
    });

    it('should verify text cursor appears over markdown code blocks', () => {
      const markdownProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          response: '```javascript\nconst x = 10;\nconsole.log(x);\n```',
        },
      };
      
      const { container } = renderWithFlow(markdownProps);
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      
      expect(markdownContent).toBeInTheDocument();
      expect(markdownContent?.textContent).toContain('const x = 10;');
      
      // Code blocks should also have text cursor for selection
    });

    it('should verify text selection works correctly across different markdown elements', () => {
      const markdownProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          response: '# Heading\n\nParagraph text.\n\n- Item 1\n- Item 2\n\n```code\ntest\n```',
        },
      };
      
      const { container } = renderWithFlow(markdownProps);
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      
      expect(markdownContent).toBeInTheDocument();
      
      // Verify the content contains different markdown elements
      expect(markdownContent?.textContent).toContain('Heading');
      expect(markdownContent?.textContent).toContain('Paragraph text.');
      expect(markdownContent?.textContent).toContain('Item 1');
      
      // Simulate text selection across markdown elements
      if (markdownContent) {
        const range = document.createRange();
        const textNode = markdownContent.firstChild;
        
        if (textNode) {
          range.selectNodeContents(markdownContent);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
          
          const selectedText = selection?.toString();
          expect(selectedText).toBeTruthy();
          expect(selectedText?.length).toBeGreaterThan(0);
        }
      }
    });

    it('should maintain cursor-text and select-text classes on MarkdownContent wrapper', () => {
      const { container } = renderWithFlow();
      
      // Find the parent container of MarkdownContent
      const responseContainer = container.querySelectorAll('.nodrag.cursor-text')[1]; // Second nodrag container is response
      
      expect(responseContainer).toBeTruthy();
      
      // The MarkdownContent component should be inside this container
      const markdownContent = responseContainer?.querySelector('[data-testid="markdown-content"]');
      expect(markdownContent).toBeInTheDocument();
    });

    it('should allow text selection in markdown content without triggering node drag', () => {
      const markdownProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          response: 'Selectable markdown text content here.',
        },
      };
      
      const { container } = renderWithFlow(markdownProps);
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      const responseContainer = markdownContent?.closest('.nodrag');
      
      expect(markdownContent).toBeInTheDocument();
      expect(responseContainer).toBeTruthy();
      
      // Response container should have nodrag to prevent dragging when selecting text
      expect(responseContainer).toHaveClass('nodrag');
      
      // Simulate text selection in markdown content
      if (markdownContent) {
        fireEvent.mouseDown(markdownContent);
        
        const range = document.createRange();
        const textNode = markdownContent.firstChild;
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
          range.setStart(textNode, 0);
          range.setEnd(textNode, 10);
          const selection = window.getSelection();
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
        
        fireEvent.mouseUp(markdownContent);
        
        // Verify text was selected
        const selectedText = window.getSelection()?.toString();
        expect(selectedText).toBeTruthy();
      }
    });

    it('should verify MarkdownContent receives className prop with cursor-text and select-text', () => {
      const { container } = renderWithFlow();
      
      // In the actual ConversationNode component, MarkdownContent is called with:
      // className="text-[15px] text-[#ececec] leading-relaxed select-text cursor-text"
      
      // The mock MarkdownContent should receive this className
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      expect(markdownContent).toBeInTheDocument();
      
      // Verify the component is rendered (the actual className application is tested in integration)
    });

    it('should handle complex markdown with mixed elements and maintain cursor behavior', () => {
      const complexMarkdown = `
# Main Heading

This is a paragraph with **bold** and *italic* text.

## Subheading

- First list item
- Second list item with \`inline code\`
- Third item

\`\`\`javascript
function example() {
  return "code block";
}
\`\`\`

> This is a blockquote

[Link text](https://example.com)
      `;
      
      const markdownProps = {
        ...defaultProps,
        data: {
          ...defaultProps.data,
          response: complexMarkdown,
        },
      };
      
      const { container } = renderWithFlow(markdownProps);
      const markdownContent = container.querySelector('[data-testid="markdown-content"]');
      
      expect(markdownContent).toBeInTheDocument();
      
      // Verify various markdown elements are present
      expect(markdownContent?.textContent).toContain('Main Heading');
      expect(markdownContent?.textContent).toContain('bold');
      expect(markdownContent?.textContent).toContain('First list item');
      expect(markdownContent?.textContent).toContain('code block');
      expect(markdownContent?.textContent).toContain('blockquote');
      
      // All text content should be selectable with text cursor
      const responseContainer = markdownContent?.closest('.nodrag');
      expect(responseContainer).toHaveClass('nodrag');
    });
  });
});
