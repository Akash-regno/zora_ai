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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ConversationNode, { ConversationNodeData } from './ConversationNode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send } from 'lucide-react';
import { getLayoutedElements } from '@/lib/utils/layout';

const nodeTypes = {
  conversation: ConversationNode as any,
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationCanvasProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onUpdate?: (nodes: Node[], edges: Edge[]) => void;
}

export default function ConversationCanvas({ 
  initialNodes = [], 
  initialEdges = [],
  onUpdate 
}: ConversationCanvasProps = {}) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [followUpParentId, setFollowUpParentId] = useState<string | null>(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nodeIdCounter = useRef(0);

  // Custom node change handler to track manual positioning
  const handleNodesChange = useCallback((changes: any) => {
    // Mark nodes as manually positioned when they're dragged
    const updatedChanges = changes.map((change: any) => {
      if (change.type === 'position' && change.dragging) {
        return {
          ...change,
          position: change.position,
        };
      }
      return change;
    });
    
    onNodesChange(updatedChanges);
    
    // After position changes, mark nodes as MANUALLY positioned
    changes.forEach((change: any) => {
      if (change.type === 'position' && !change.dragging && change.position) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === change.id
              ? { ...node, data: { ...node.data, positioned: true, manuallyPositioned: true } }
              : node
          )
        );
      }
    });
  }, [onNodesChange, setNodes]);

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

  // Notify parent of changes
  useEffect(() => {
    if (onUpdate && nodes.length > 0) {
      onUpdate(nodes, edges);
    }
  }, [nodes, edges, onUpdate]);

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
        positioned: false,
        manuallyPositioned: false,
      },
    };

    // Keep existing nodes as-is (don't change their positioned status)
    const newNodes = [...nodes, conversationNode];
    const newEdges = [...edges];

    if (parentId) {
      newEdges.push({ id: `${parentId}-${nodeId}`, source: parentId, target: nodeId });
    }

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    setIsLoading(false);
  }, [nodes, edges, getConversationHistory, setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddFollowUp = useCallback((parentNodeId: string, question: string) => {
    createConversationNode(question, parentNodeId);
  }, [createConversationNode]);

  // Update all nodes with the latest callback when it changes
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddFollowUp: handleAddFollowUp,
        },
      }))
    );
  }, [handleAddFollowUp, setNodes]);

  const handleSubmitFollowUp = useCallback(async () => {
    if (!followUpQuestion.trim() || !followUpParentId) return;

    await createConversationNode(followUpQuestion, followUpParentId);
    setIsAddingFollowUp(false);
    setFollowUpQuestion('');
    setFollowUpParentId(null);
  }, [followUpQuestion, followUpParentId, createConversationNode]);

  const handleStartConversation = useCallback(async () => {
    const question = searchTerm.trim();
    if (!question) return;

    await createConversationNode(question, null);
    setSearchTerm('');
  }, [createConversationNode, searchTerm]);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

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
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 0.7 }}
        minZoom={0.1}
        maxZoom={2}
        noWheelClassName="nowheel"
        noDragClassName="nodrag"
        zoomOnScroll={true}
        panOnScroll={false}
        panOnDrag={true}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="rgba(255, 255, 255, 0.03)" gap={20} size={1} />
        {nodes.length > 0 && (
          <>
            <Controls 
              className="!bg-transparent !border-none !shadow-none"
              showZoom={true}
              showFitView={true}
              showInteractive={false}
            />
            <MiniMap 
              className="!bg-[#1a1a1a] !border-[#3a3a3a] !rounded-2xl !shadow-2xl !overflow-hidden backdrop-blur-sm" 
              maskColor="rgba(13, 13, 13, 0.85)"
              nodeColor="#2f2f2f"
              nodeStrokeColor="#4d4d4d"
              nodeBorderRadius={8}
              maskStrokeColor="#565656"
              maskStrokeWidth={2}
            />
          </>
        )}
        
        {/* ChatGPT-style centered input when no nodes */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-normal text-[#ececec] mb-2">What&apos;s on your mind today?</h1>
            </div>
            <div className="w-full max-w-3xl px-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Ask anything"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim() && !isLoading) {
                      handleStartConversation();
                    }
                  }}
                  disabled={isLoading}
                  className="w-full h-14 bg-[#2f2f2f] border border-[#565656] text-[#ececec] placeholder:text-[#8e8e8e] rounded-3xl px-5 pr-14 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                />
                {isLoading ? (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-[#565656] border-t-[#ececec] rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <Button
                    onClick={handleStartConversation}
                    disabled={!searchTerm.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-full bg-[#ececec] hover:bg-[#d4d4d4] text-[#0d0d0d] disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}


      </ReactFlow>

      <Dialog open={isAddingFollowUp} onOpenChange={setIsAddingFollowUp}>
        <DialogContent className="bg-[#2f2f2f] border border-[#4d4d4d] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#ececec] font-semibold text-lg">Add Follow-up Question</DialogTitle>
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
              className="bg-[#212121] border border-[#4d4d4d] text-[#ececec] placeholder:text-[#8e8e8e] focus:border-[#565656] focus:ring-0 rounded-lg"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddingFollowUp(false)} disabled={isLoading} className="border-[#4d4d4d] text-[#ececec] hover:bg-[#212121] rounded-lg">
                Cancel
              </Button>
              <Button onClick={handleSubmitFollowUp} disabled={isLoading || !followUpQuestion.trim()} className="bg-[#ececec] hover:bg-[#d4d4d4] text-[#0d0d0d] rounded-lg font-medium">
                {isLoading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
