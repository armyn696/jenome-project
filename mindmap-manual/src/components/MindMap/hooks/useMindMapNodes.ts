import { useCallback, useRef } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { CustomNode } from '../types';

interface HistoryState {
  nodes: CustomNode[];
  edges: any[];
}

const initialNodes: CustomNode[] = [
  {
    id: 'center',
    type: 'centerNode',
    position: { x: 0, y: 0 },
    data: { 
      id: 'center',
      label: 'Click to edit',
      onAddBranch: undefined,
      onColorChange: undefined,
      onDelete: undefined
    },
  },
];

export const useMindMapNodes = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const historyRef = useRef<{
    past: HistoryState[];
    future: HistoryState[];
  }>({
    past: [],
    future: [],
  });

  const selectedNodes = nodes.filter(node => node.selected);

  const saveToHistory = useCallback(() => {
    historyRef.current.past.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    historyRef.current.future = [];
  }, [nodes, edges]);

  // Helper function to ensure all handlers are properly attached to nodes
  const attachHandlers = useCallback((node: CustomNode) => {
    return {
      ...node,
      data: {
        ...node.data,
        onAddBranch: (parentId: string, direction: 'left' | 'right') => addBranch(parentId, direction),
        onColorChange: (nodeId: string, color: string) => handleColorChange(nodeId, color),
        onDelete: (nodeId: string) => deleteNode(nodeId)
      }
    };
  }, []);

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  const getDescendantsAndEdges = useCallback((nodeId: string, visited = new Set<string>()): {
    nodeIds: Set<string>;
    edgeIds: Set<string>;
  } => {
    if (visited.has(nodeId)) return { nodeIds: new Set(), edgeIds: new Set() };
    visited.add(nodeId);
    
    const result = {
      nodeIds: new Set<string>([nodeId]),
      edgeIds: new Set<string>()
    };

    const connectedEdges = edges.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    );

    connectedEdges.forEach(edge => result.edgeIds.add(edge.id));

    connectedEdges
      .filter(edge => edge.source === nodeId)
      .forEach(edge => {
        const childResults = getDescendantsAndEdges(edge.target, visited);
        childResults.nodeIds.forEach(id => result.nodeIds.add(id));
        childResults.edgeIds.forEach(id => result.edgeIds.add(id));
      });

    return result;
  }, [edges]);

  const handleColorChange = useCallback((nodeId: string, color: string) => {
    setNodes((nds) => {
      const descendants = Array.from(getDescendantsAndEdges(nodeId).nodeIds);
      
      return nds.map((node) => {
        if (node.id === nodeId || descendants.includes(node.id)) {
          return attachHandlers({
            ...node,
            data: { 
              ...node.data, 
              color
            },
          });
        }
        return node;
      });
    });
  }, [getDescendantsAndEdges, attachHandlers]);

  const deleteNode = useCallback((nodeId: string) => {
    saveToHistory();
    const { nodeIds, edgeIds } = getDescendantsAndEdges(nodeId);
    
    setNodes(nodes => nodes.filter(node => !nodeIds.has(node.id)));
    setEdges(edges => edges.filter(edge => !edgeIds.has(edge.id)));
  }, [getDescendantsAndEdges]);

  const deleteSelectedNodes = useCallback(() => {
    saveToHistory();
    const nodesToDelete = new Set<string>();
    const edgesToDelete = new Set<string>();
    
    selectedNodes.forEach(node => {
      const { nodeIds, edgeIds } = getDescendantsAndEdges(node.id);
      nodeIds.forEach(id => nodesToDelete.add(id));
      edgeIds.forEach(id => edgesToDelete.add(id));
    });

    setNodes(nodes => nodes.filter(node => !nodesToDelete.has(node.id)));
    setEdges(edges => edges.filter(edge => !edgesToDelete.has(edge.id)));
  }, [selectedNodes, getDescendantsAndEdges]);

  const addBranch = useCallback((parentId: string, direction: 'left' | 'right') => {
    saveToHistory();
    const parent = nodes.find((node) => node.id === parentId);
    if (!parent) return;

    const existingBranches = nodes.filter(
      (node) => edges.some((edge) => 
        edge.source === parentId && 
        edge.target === node.id &&
        (node.data as any).direction === direction
      )
    ).length;

    const newNodeId = `node_${nodes.length + 1}`;
    const newNode = attachHandlers({
      id: newNodeId,
      type: 'branchNode',
      position: {
        x: parent.position.x + (direction === 'right' ? 250 : -250),
        y: parent.position.y + existingBranches * 100,
      },
      data: { 
        id: newNodeId,
        label: 'New Branch', 
        direction,
        color: parent.data.color
      },
    });

    setNodes((nds) => [...nds.map(attachHandlers), newNode]);
    setEdges((eds) => [
      ...eds,
      {
        id: `e${parentId}-${newNode.id}`,
        source: parentId,
        target: newNode.id,
        sourceHandle: direction,
        type: 'smoothstep',
      },
    ]);
  }, [nodes, edges, attachHandlers]);

  const undo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (past.length === 0) return;

    const previous = past.pop()!;
    future.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });

    // Ensure that we restore the previous state correctly
    setNodes(previous.nodes.map(attachHandlers));
    setEdges(previous.edges.map(edge => ({ ...edge, type: 'smoothstep' }))); // Ensure edges are smoothstep
  }, [nodes, edges, setNodes, setEdges, attachHandlers]);

  const redo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (future.length === 0) return;

    const next = future.pop()!;
    past.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    });

    setNodes(next.nodes.map(attachHandlers));
    setEdges(next.edges);
  }, [nodes, edges, setNodes, setEdges, attachHandlers]);

  const canUndo = historyRef.current.past.length > 0;
  const canRedo = historyRef.current.future.length > 0;

  return {
    nodes: nodes.map(attachHandlers),
    edges,
    onNodesChange: handleNodesChange,
    onEdgesChange: handleEdgesChange,
    addBranch,
    setEdges,
    deleteNode,
    selectedNodes,
    deleteSelectedNodes,
    undo,
    redo,
    canUndo,
    canRedo
  };
};