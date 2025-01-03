import { 
  ReactFlow, 
  Background, 
  Controls, 
  NodeTypes, 
  Panel, 
  SelectionMode,
  Connection,
  useReactFlow,
  useKeyPress,
  MarkerType
} from '@xyflow/react';
import CenterNode from '../CenterNode';
import BranchNode from '../BranchNode';
import { useMindMapNodes } from '../hooks/useMindMapNodes';
import { addEdge } from '@xyflow/react';
import { CustomNode } from '../types';
import { Trash2, Undo2, Redo2 } from 'lucide-react';
import { useMemo, useCallback, useEffect, useState } from 'react';
import { EdgeSettingsPanel } from './EdgeSettingsPanel';

const nodeTypes = {
  centerNode: CenterNode,
  branchNode: BranchNode,
} as NodeTypes;

export const MindMapFlow = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addBranch,
    setEdges,
    deleteNode,
    selectedNodes,
    deleteSelectedNodes,
    undo,
    redo,
    canUndo,
    canRedo
  } = useMindMapNodes();

  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [edgeSettingsPosition, setEdgeSettingsPosition] = useState<{ x: number; y: number } | null>(null);

  const defaultEdgeOptions = {
    type: 'smoothstep',
    markerEnd: {
      type: MarkerType.None,
      width: 20,
      height: 20,
    },
    markerStart: {
      type: MarkerType.None,
      width: 20,
      height: 20,
    },
    style: {
      strokeWidth: 2,
    },
  };

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setSelectedEdge(edge);
    setEdgeSettingsPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, []);

  const handleEdgeSettingsChange = useCallback(
    (settings: {
      strokeWidth?: number;
      startArrow?: string;
      endArrow?: string;
      opacity?: number;
    }) => {
      if (!selectedEdge) return;

      const updatedEdges = edges.map((edge) => {
        if (edge.id === selectedEdge.id) {
          const sourceNode = nodes.find(n => n.id === edge.source);
          const edgeColor = sourceNode?.data?.color || '#3b82f6';
          
          const markerStart = settings.startArrow ? {
            type: settings.startArrow === 'arrow' ? MarkerType.Arrow :
                  settings.startArrow === 'diamond' ? MarkerType.ArrowClosed :
                  MarkerType.None,
            width: 20,
            height: 20,
            color: edgeColor,
          } : edge.markerStart;

          const markerEnd = settings.endArrow ? {
            type: settings.endArrow === 'arrow' ? MarkerType.Arrow :
                  settings.endArrow === 'diamond' ? MarkerType.ArrowClosed :
                  MarkerType.None,
            width: 20,
            height: 20,
            color: edgeColor,
          } : edge.markerEnd;

          return {
            ...edge,
            type: 'smoothstep',
            style: {
              ...edge.style,
              stroke: edgeColor,
              strokeWidth: settings.strokeWidth ?? edge.style?.strokeWidth,
              opacity: settings.opacity !== undefined ? settings.opacity : edge.style?.opacity,
            },
            markerStart,
            markerEnd,
          };
        }
        return edge;
      });

      setEdges(updatedEdges);
    },
    [selectedEdge, edges, setEdges, nodes]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedEdge(null);
    setEdgeSettingsPosition(null);
  }, []);

  // Handle keyboard shortcuts
  const ctrlPressed = useKeyPress('Control');
  const zPressed = useKeyPress('z');
  const yPressed = useKeyPress('y');

  // Effect for keyboard shortcuts
  useEffect(() => {
    if (ctrlPressed && zPressed && canUndo) {
      undo();
    }
    if (ctrlPressed && yPressed && canRedo) {
      redo();
    }
  }, [ctrlPressed, zPressed, yPressed, canUndo, canRedo, undo, redo]);

  const selectionArea = useMemo(() => {
    if (selectedNodes.length === 0) return null;
    const selectedIds = new Set(selectedNodes.map(node => node.id));
    const connectedNodes = new Set<string>();
    edges.forEach(edge => {
      if (selectedIds.has(edge.source) || selectedIds.has(edge.target)) {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      }
    });
    return connectedNodes;
  }, [selectedNodes, edges]);

  const isValidConnection = (connection: Connection) => {
    if (!connection.source || !connection.target) return false;
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    if (!sourceNode || !targetNode) return false;
    const hasExistingConnection = edges.some(edge => edge.target === connection.target);
    if (hasExistingConnection) return false;
    if (sourceNode.type === 'centerNode' && targetNode.type !== 'branchNode') return false;
    if (sourceNode.type === 'branchNode' && targetNode.type !== 'branchNode') return false;
    return true;
  };

  const onConnect = (params: Connection) => {
    if (isValidConnection(params)) {
      setEdges((eds) => addEdge(params, eds));
    }
  };

  return (
    <div className="w-screen h-screen">
      <ReactFlow
        nodes={nodes.map((node: CustomNode) => ({
          ...node,
          data: {
            ...node.data,
            onAddBranch: addBranch,
            onDelete: deleteNode,
          },
          style: {
            ...node.style,
            backgroundColor: selectionArea?.has(node.id) ? 'rgba(239, 246, 255, 0.8)' : undefined,
          },
          className: `${selectedNodes.some(n => n.id === node.id) ? 'border-2 border-blue-500' : ''}`
        }))}
        edges={edges.map(edge => ({
          ...edge,
          ...defaultEdgeOptions,
          style: {
            ...edge.style,
            stroke: edge.source ? nodes.find(n => n.id === edge.source)?.data?.color || '#3b82f6' : undefined,
            strokeWidth: edge.style?.strokeWidth || defaultEdgeOptions.style.strokeWidth,
            opacity: edge.style?.opacity !== undefined ? edge.style.opacity : 1,
          },
          markerStart: edge.markerStart || defaultEdgeOptions.markerStart,
          markerEnd: edge.markerEnd || defaultEdgeOptions.markerEnd,
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        multiSelectionKeyCode="Shift"
        selectionOnDrag={true}
        selectionMode={SelectionMode.Full}
        selectNodesOnDrag={false}
        selectionKeyCode="Shift"
        deleteKeyCode={null}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        selectionBoxStyle={{
          backgroundColor: 'rgba(0, 89, 220, 0.08)',
          border: '1px solid rgba(0, 89, 220, 0.4)',
          borderRadius: '4px'
        }}
        multiSelectionActive={true}
        selectionKey="Shift"
        connectOnClick={false}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
      >
        <Background />
        <Controls />
        <Panel position="top-right" className="bg-white p-2 rounded-lg shadow-md flex gap-2">
          {selectedNodes.length > 0 && (
            <button
              onClick={deleteSelectedNodes}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedNodes.length})
            </button>
          )}
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`flex items-center gap-1 px-2 py-1 rounded ${
              canUndo ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`flex items-center gap-1 px-2 py-1 rounded ${
              canRedo ? 'text-blue-600 hover:text-blue-700' : 'text-gray-400'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </Panel>
        <EdgeSettingsPanel
          edge={selectedEdge}
          onSettingsChange={handleEdgeSettingsChange}
          position={edgeSettingsPosition}
        />
      </ReactFlow>
    </div>
  );
};