"use client";

import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export interface QuestionNodeData extends Record<string, unknown> {
  content: string;
  timestamp: string;
}

export default function QuestionNode({ data }: NodeProps<any>) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Card className="min-w-[300px] max-w-[400px] p-4 bg-blue-50 border-blue-300 shadow-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-blue-600 font-medium mb-1">Question</div>
            <div className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {data.content}
            </div>
            <div className="text-xs text-gray-500 mt-2">{data.timestamp}</div>
          </div>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </>
  );
}
