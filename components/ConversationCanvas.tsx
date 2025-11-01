"use client";

import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ConversationNode, { ConversationNodeData } from './ConversationNode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Search, Plus } from 'lucide-react';
import { getLayoutedElements } from '@/lib/layoutUtils';

const nodeTypes = {
  conversation: ConversationNode as any,
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ConversationCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [followUpParentId, setFollowUpParentId] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nodeIdCounter = useRef(0);

  const getConversationHistory = useCallback((nodeId: string): Message[] => {
    const history: Message[] = [];
    let currentNodeId: string | null = nodeId;

    while (currentNodeId) {
      const currentNode = nodes.find((n) => n.id === currentNodeId);
      if (!currentNode) break;

      if (currentNode.type === 'conversation') {
        const nodeData = currentNode.data as unknown as ConversationNodeData;
        history.unshift(
          { role: 'user', content: nodeData.question },
          { role: 'assistant', content: nodeData.response }
        );
      }

      const parentEdge = edges.find((e) => e.target === currentNodeId);
      currentNodeId = parentEdge ? parentEdge.source : null;
    }

    return history;
  }, [nodes, edges]);

  const handleAddFollowUp = useCallback((parentNodeId: string) => {
    setFollowUpParentId(parentNodeId);
    setIsAddingFollowUp(true);
  }, []);

  const createConversationNode = useCallback(async (question: string, parentId: string | null) => {
    setIsLoading(true);
    const timestamp = new Date().toLocaleString();
    const nodeId = `conversation-${nodeIdCounter.current++}`;

    let conversationHistory: Message[] = [];
    if (parentId) {
      conversationHistory = getConversationHistory(parentId);
    }
    conversationHistory.push({ role: 'user', content: question });

    let aiResponse = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      aiResponse = data.response;
    } catch (error) {
      console.error('Error fetching AI response:', error);
      aiResponse = 'Sorry, I encountered an error. Please try again.';
    }

    const conversationNode: Node<ConversationNodeData> = {
      id: nodeId,
      type: 'conversation',
      position: { x: 0, y: 0 },
      data: {
        question,
        response: aiResponse,
        timestamp,
        onAddFollowUp: handleAddFollowUp,
      },
    };

    const newNodes = [...nodes, conversationNode];
    const newEdges = [...edges];

    if (parentId) {
      newEdges.push({ id: `${parentId}-${nodeId}`, source: parentId, target: nodeId });
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setIsLoading(false);
  }, [nodes, edges, getConversationHistory, handleAddFollowUp, setNodes, setEdges]);

  const handleSubmitFollowUp = useCallback(async () => {
    if (!followUpQuestion.trim() || !followUpParentId) return;

    await createConversationNode(followUpQuestion, followUpParentId);
    setIsAddingFollowUp(false);
    setFollowUpQuestion('');
    setFollowUpParentId(null);
  }, [followUpQuestion, followUpParentId, createConversationNode]);

  const handleStartConversation = useCallback(async () => {
    const question = prompt('Enter your question:');
    if (!question) return;

    await createConversationNode(question, null);
  }, [createConversationNode]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const handleExport = useCallback(() => {
    const graphData = { nodes, edges };
    const dataStr = JSON.stringify(graphData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `bubbles-conversation-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [nodes, edges]);

  const filteredNodes = searchTerm
    ? nodes.filter((node) => {
        if (node.type === 'conversation') {
          const nodeData = node.data as unknown as ConversationNodeData;
          return (
            nodeData.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            nodeData.response.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        return false;
      })
    : nodes;

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} color="#e5e5e5" gap={16} size={1} />
        <Controls />
        <MiniMap />
        <Panel position="top-left" className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 space-y-3">
          <div className="font-bold text-xl text-gray-800">Bubbles</div>
          <div className="flex gap-2">
            <Button onClick={handleStartConversation} size="sm" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              <Plus className="w-4 h-4 mr-1" />
              New Question
            </Button>
            <Button onClick={handleExport} size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Search className="w-4 h-4" />
            <Input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </Panel>
      </ReactFlow>

      <Dialog open={isAddingFollowUp} onOpenChange={setIsAddingFollowUp}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-800 font-semibold">Add Follow-up Question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter your follow-up question..."
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitFollowUp();
                }
              }}
              disabled={isLoading}
              className="border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddingFollowUp(false)} disabled={isLoading} className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
              <Button onClick={handleSubmitFollowUp} disabled={isLoading || !followUpQuestion.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
