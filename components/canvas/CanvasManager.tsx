"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ConversationCanvas from './ConversationCanvas';
import Sidebar from '@/components/layout/Sidebar';
import AuthModal from '@/components/auth/AuthModal';
import { Node, Edge } from '@xyflow/react';
import { useAuth } from '@/lib/contexts/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';

interface CanvasData {
  id: string;
  name: string;
  createdAt: string;
  nodes: Node[];
  edges: Edge[];
}

export default function CanvasManager() {
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [currentCanvasId, setCurrentCanvasId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, signOut, loading: authLoading } = useAuth();

  const loadCanvases = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('canvases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedCanvases = data.map((canvas) => ({
          id: canvas.id,
          name: canvas.name,
          createdAt: canvas.created_at,
          nodes: canvas.nodes || [],
          edges: canvas.edges || [],
        }));
        setCanvases(formattedCanvases);
        setCurrentCanvasId(formattedCanvases[0].id);
      } else {
        // No canvases yet - user will create one manually
        setCanvases([]);
        setCurrentCanvasId(null);
      }
    } catch (error) {
      console.error('Failed to load canvases:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load canvases from Supabase on mount
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      setAuthModalOpen(true);
      return;
    }

    // User is logged in, close the auth modal and load canvases
    setAuthModalOpen(false);
    loadCanvases();
  }, [user, authLoading, loadCanvases]);





  // Save canvas to Supabase whenever it changes
  const saveCanvas = async (canvas: CanvasData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('canvases')
        .upsert({
          id: canvas.id,
          user_id: user.id,
          name: canvas.name,
          nodes: canvas.nodes,
          edges: canvas.edges,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  };

  const handleNewCanvas = async () => {
    if (!user) {
      console.error('No user logged in');
      alert('Please sign in to create a canvas');
      return;
    }

    // Create temporary canvas for optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const tempCanvas: CanvasData = {
      id: tempId,
      name: `Canvas ${canvases.length + 1}`,
      createdAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    };

    // Optimistic update - show immediately
    setCanvases([tempCanvas, ...canvases]);
    setCurrentCanvasId(tempId);

    // Save to database in background
    try {
      const { data, error } = await supabase
        .from('canvases')
        .insert({
          user_id: user.id,
          name: tempCanvas.name,
          nodes: [],
          edges: [],
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save canvas:', error);
        // Rollback on error
        setCanvases(canvases);
        setCurrentCanvasId(canvases.length > 0 ? canvases[0].id : null);
        alert(`Failed to create canvas: ${error.message}`);
        return;
      }

      if (data) {
        // Replace temp canvas with real one from database
        const realCanvas: CanvasData = {
          id: data.id,
          name: data.name,
          createdAt: data.created_at,
          nodes: data.nodes || [],
          edges: data.edges || [],
        };

        setCanvases((prev) =>
          prev.map((c) => (c.id === tempId ? realCanvas : c))
        );
        setCurrentCanvasId(realCanvas.id);
      }
    } catch (error: any) {
      console.error('Failed to create canvas:', error);
      // Rollback on error
      setCanvases(canvases);
      setCurrentCanvasId(canvases.length > 0 ? canvases[0].id : null);
      alert(`Failed to create canvas: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSelectCanvas = (id: string) => {
    setCurrentCanvasId(id);
  };

  const handleDeleteCanvas = async (id: string) => {
    if (!user) {
      console.error('No user logged in');
      return;
    }

    // Store old state for rollback
    const oldCanvases = canvases;
    const oldCurrentId = currentCanvasId;

    // Optimistic update - update UI immediately
    const newCanvases = canvases.filter((c) => c.id !== id);
    setCanvases(newCanvases);

    // If we deleted the current canvas, switch to another or null
    if (currentCanvasId === id) {
      setCurrentCanvasId(newCanvases.length > 0 ? newCanvases[0].id : null);
    }

    // Delete from database in background
    try {
      const { error } = await supabase.from('canvases').delete().eq('id', id);

      if (error) {
        console.error('Failed to delete canvas:', error);
        // Rollback on error
        setCanvases(oldCanvases);
        setCurrentCanvasId(oldCurrentId);
        alert(`Failed to delete canvas: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Failed to delete canvas:', error);
      // Rollback on error
      setCanvases(oldCanvases);
      setCurrentCanvasId(oldCurrentId);
    }
  };

  const handleCanvasUpdate = async (nodes: Node[], edges: Edge[]) => {
    if (!currentCanvasId || !user) {
      return;
    }

    // Update local state
    setCanvases((prev) =>
      prev.map((canvas) =>
        canvas.id === currentCanvasId ? { ...canvas, nodes, edges } : canvas
      )
    );

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('canvases')
        .update({
          nodes,
          edges,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentCanvasId);

      if (error) {
        console.error('Failed to save canvas:', error);
      }
    } catch (error) {
      console.error('Failed to save canvas:', error);
    }
  };

  const handleSignOut = async () => {
    console.log('handleSignOut called');
    
    // Clear local state immediately
    setCanvases([]);
    setCurrentCanvasId(null);
    
    try {
      // Sign out from Supabase (with timeout)
      const signOutPromise = signOut();
      const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2000));
      
      await Promise.race([signOutPromise, timeoutPromise]);
      console.log('Sign out complete');
      
      // Force reload to clear everything
      window.location.reload();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force reload anyway
      window.location.reload();
    }
  };

  const currentCanvas = canvases.find((c) => c.id === currentCanvasId);

  const canvasSummaries = canvases.map((canvas) => ({
    id: canvas.id,
    name: canvas.name,
    createdAt: canvas.createdAt,
    nodeCount: canvas.nodes.length,
  }));

  if (authLoading || loading) {
    return (
      <div className="flex h-screen bg-[#212121] items-center justify-center">
        <div className="text-[#ececec]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex h-screen bg-[#212121] items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-[#ececec] mb-4">Welcome to Bubbles</h1>
            <p className="text-[#8e8e8e] mb-6">Sign in to start your conversation journey</p>
            <Button
              onClick={() => setAuthModalOpen(true)}
              className="bg-[#ececec] hover:bg-[#d4d4d4] text-[#0d0d0d] rounded-lg font-medium"
            >
              Get Started
            </Button>
          </div>
        </div>
        <AuthModal 
          open={authModalOpen && !user} 
          onOpenChange={setAuthModalOpen} 
        />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-[#212121]">
      <Sidebar
        canvases={canvasSummaries}
        currentCanvasId={currentCanvasId}
        onSelectCanvas={handleSelectCanvas}
        onNewCanvas={handleNewCanvas}
        onDeleteCanvas={handleDeleteCanvas}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        userEmail={user?.email}
        onSignOut={handleSignOut}
      />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <ConversationCanvas
          key={currentCanvas?.id || 'empty-canvas'}
          initialNodes={currentCanvas?.nodes || []}
          initialEdges={currentCanvas?.edges || []}
          onUpdate={(nodes, edges) => {
            if (currentCanvasId) {
              handleCanvasUpdate(nodes, edges);
            }
          }}
        />
      </div>

      <AuthModal open={authModalOpen && !user} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
