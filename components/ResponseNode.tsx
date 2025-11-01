"use client";

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Plus, ChevronDown, ChevronUp } from 'lucide-react';

export interface ResponseNodeData extends Record<string, unknown> {
  content: string;
  timestamp: string;
  onAddFollowUp: (nodeId: string) => void;
}

export default function ResponseNode({ id, data }: NodeProps<any>) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isLongContent = data.content.length > 300;

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Card className="min-w-[300px] max-w-[450px] p-4 bg-green-50 border-green-300 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-green-600 font-medium mb-1">AI Response</div>
            <div className={`text-sm text-gray-800 whitespace-pre-wrap break-words ${isCollapsed ? 'line-clamp-3' : ''}`}>
              {data.content}
            </div>
            {isLongContent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mt-2 h-6 text-xs px-2"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Show more
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3 h-3 mr-1" />
                    Show less
                  </>
                )}
              </Button>
            )}
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">{data.timestamp}</div>
              <Button
                size="sm"
                onClick={() => data.onAddFollowUp(id)}
                className="h-7 text-xs bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-3 h-3 mr-1" />
                Follow-up
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </>
  );
}
