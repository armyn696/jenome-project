import { Node } from '@xyflow/react';

export interface NodeData extends Record<string, unknown> {
  id: string;
  label: string;
  color?: string;
  onAddBranch?: (parentId: string, direction: 'left' | 'right') => void;
  onColorChange?: (nodeId: string, color: string) => void;
  onDelete?: (nodeId: string) => void;
  onLabelChange?: (nodeId: string, newLabel: string) => void;
}

export interface BranchNodeData extends NodeData {
  direction: 'left' | 'right';
}

export interface CenterNodeData extends NodeData {
}

export type CustomNode = Node<NodeData>;
export type BranchNode = Node<BranchNodeData>;
export type CenterNode = Node<CenterNodeData>;
