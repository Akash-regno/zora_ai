import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';

const nodeWidth = 450;
const nodeHeight = 350;

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ 
    rankdir: 'TB',
    nodesep: 150,
    ranksep: 100,
    edgesep: 50,
    marginx: 50,
    marginy: 50
  });

  // Separate manually positioned nodes from auto-layout nodes
  const manualNodes = nodes.filter(n => n.data?.manuallyPositioned);
  const autoNodes = nodes.filter(n => !n.data?.manuallyPositioned);

  // Add all nodes to dagre for layout calculation
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Run dagre layout
  dagre.layout(dagreGraph);

  // Apply layout: use dagre positions for auto nodes, keep manual positions
  const layoutedNodes = nodes.map((node) => {
    // If manually positioned, keep the user's position
    if (node.data?.manuallyPositioned) {
      return node;
    }
    
    // Otherwise use dagre's calculated position
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      data: {
        ...node.data,
        positioned: true,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};
