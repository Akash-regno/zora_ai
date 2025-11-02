"use client";

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import MarkdownContent from '@/components/shared/MarkdownContent';

export interface ConversationNodeData extends Record<string, unknown> {
  question: string;
  response: string;
  timestamp: string;
  onAddFollowUp: (nodeId: string, question: string) => void;
}

export default function ConversationNode({ id, data }: NodeProps<any>) {
  const totalLength = data.question.length + data.response.length;
  const isLongContent = totalLength > 600;
  const [followUpText, setFollowUpText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const showFooter = isHovered || isInputFocused;

  // Completely prevent ReactFlow from handling any mouse events in text areas
  const preventReactFlowEvents = (e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-[#565656] rounded-full" />
      <Card 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-[450px] bg-[#2f2f2f] border border-[#4d4d4d] rounded-2xl shadow-lg overflow-hidden flex flex-col nowheel select-none transition-all duration-300 ease-in-out ${
          isLongContent 
            ? (showFooter ? 'h-[468px]' : 'h-[400px]')
            : (showFooter ? '' : '')
        }`}
      >
        <div className={`p-6 space-y-4 scrollbar-thin ${isLongContent ? 'flex-1 overflow-y-auto' : ''}`}>
          <div 
            className="nodrag text-content"
            onPointerDown={preventReactFlowEvents}
            onPointerUp={preventReactFlowEvents}
            onPointerMove={preventReactFlowEvents}
            onMouseDown={preventReactFlowEvents}
            onMouseUp={preventReactFlowEvents}
            onMouseMove={preventReactFlowEvents}
            onClick={preventReactFlowEvents}
            onDoubleClick={preventReactFlowEvents}
          >
            <div className="text-[15px] text-[#ececec] whitespace-pre-wrap break-words leading-relaxed">
              {data.question}
            </div>
          </div>

          <div className="border-t border-[#4d4d4d]"></div>

          <div 
            className="nodrag text-content"
            onPointerDown={preventReactFlowEvents}
            onPointerUp={preventReactFlowEvents}
            onPointerMove={preventReactFlowEvents}
            onMouseDown={preventReactFlowEvents}
            onMouseUp={preventReactFlowEvents}
            onMouseMove={preventReactFlowEvents}
            onClick={preventReactFlowEvents}
            onDoubleClick={preventReactFlowEvents}
          >
            <MarkdownContent content={data.response} className="text-[15px] text-[#ececec] leading-relaxed" />
          </div>
        </div>

        <div className={`border-t border-[#4d4d4d] bg-[#212121] select-none transition-all duration-300 ease-in-out ${
          showFooter 
            ? 'h-[68px] opacity-100' 
            : 'h-0 opacity-0'
        }`}>
          <div className={`px-6 py-4 select-none transition-opacity duration-300 ${showFooter ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative select-none">
              <Input
                type="text"
                placeholder="Ask a follow-up..."
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && followUpText.trim()) {
                    data.onAddFollowUp(id, followUpText.trim());
                    setFollowUpText('');
                  }
                }}
                className="w-full h-9 bg-[#2f2f2f] border border-[#565656] text-[#ececec] placeholder:text-[#8e8e8e] rounded-lg px-3 pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm nodrag"
              />
              <Button
                onClick={() => {
                  if (followUpText.trim()) {
                    data.onAddFollowUp(id, followUpText.trim());
                    setFollowUpText('');
                  }
                }}
                disabled={!followUpText.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 rounded-md bg-[#ececec] hover:bg-[#d4d4d4] text-[#0d0d0d] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity select-none"
              >
                <Send className="w-3.5 h-3.5" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-[#565656] rounded-full" />
    </>
  );
}
