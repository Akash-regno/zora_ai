"use client";

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Sparkles, Plus } from 'lucide-react';

export interface ConversationNodeData extends Record<string, unknown> {
  question: string;
  response: string;
  timestamp: string;
  onAddFollowUp: (nodeId: string) => void;
}

export default function ConversationNode({ id, data }: NodeProps<any>) {
  return (
    <>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-gray-400" />
      <Card className="min-w-[400px] max-w-[500px] bg-white border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 bg-gray-700 rounded-sm flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 mb-2">You</div>
              <div className="text-[15px] text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                {data.question}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100"></div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-7 h-7 bg-emerald-600 rounded-sm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800 mb-2">ChatGPT</div>
              <div className="text-[15px] text-gray-800 whitespace-pre-wrap break-words leading-relaxed">
                {data.response}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">{data.timestamp}</div>
            <Button
              size="sm"
              onClick={() => data.onAddFollowUp(id)}
              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add branch
            </Button>
          </div>
        </div>
      </Card>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-gray-400" />
    </>
  );
}
