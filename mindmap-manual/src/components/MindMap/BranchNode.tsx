import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { PlusCircle } from 'lucide-react';
import { BranchNodeData } from './types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const colors = {
  'Purple': '#9b87f5',
  'Blue': '#0EA5E9',
  'Green': '#22C55E',
  'Orange': '#F97316',
  'Pink': '#D946EF',
  'Red': '#ea384c'
};

const BranchNode = ({ data }: { data: BranchNodeData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleColorSelect = (color: string) => {
    data.onColorChange?.(data.id, color);
  };

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    data.onLabelChange?.(data.id, newLabel);
  };

  const getLighterColor = (color: string) => {
    return color ? `${color}15` : 'transparent';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group">
          <div 
            className="flex items-center justify-center min-w-[150px] bg-white rounded-lg shadow-md border border-gray-200 p-3"
            style={{ 
              borderColor: data.color || '#e5e7eb',
              borderWidth: '2px',
              backgroundColor: getLighterColor(data.color),
            }}
          >
            {isEditing ? (
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={() => {
                  setIsEditing(false);
                  handleLabelChange(label);
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
                    handleLabelChange(label);
                  }
                }}
                className="w-full text-center border-none outline-none bg-transparent"
                autoFocus
              />
            ) : (
              <div onClick={() => setIsEditing(true)} className="cursor-text">
                {label}
              </div>
            )}
          </div>
          
          {/* For right-side branches */}
          {data.direction === 'right' && (
            <>
              <Handle
                type="target"
                position={Position.Left}
                className="w-2 h-2 !left-[-1px] !opacity-0"
                style={{ backgroundColor: data.color || '#3b82f6' }}
              />
              <Handle
                type="source"
                position={Position.Right}
                id="right"
                className="w-2 h-2 !right-[-1px] !opacity-0"
                style={{ backgroundColor: data.color || '#3b82f6' }}
              />
            </>
          )}
          
          {/* For left-side branches */}
          {data.direction === 'left' && (
            <>
              <Handle
                type="target"
                position={Position.Right}
                className="w-2 h-2 !right-[-1px] !opacity-0"
                style={{ backgroundColor: data.color || '#3b82f6' }}
              />
              <Handle
                type="source"
                position={Position.Left}
                id="left"
                className="w-2 h-2 !left-[-1px] !opacity-0"
                style={{ backgroundColor: data.color || '#3b82f6' }}
              />
            </>
          )}
          
          <div 
            className={`absolute ${
              data.direction === 'left' ? 'left-0 -translate-x-12' : 'right-0 translate-x-12'
            } top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              data.onAddBranch?.(data.id, data.direction);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
          >
            <PlusCircle className="w-6 h-6 text-blue-500 hover:text-blue-600" />
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {Object.entries(colors).map(([name, value]) => (
          <ContextMenuItem
            key={value}
            onClick={() => handleColorSelect(value)}
            className="flex items-center gap-2"
          >
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: value }}
            />
            {name}
          </ContextMenuItem>
        ))}
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-red-600"
          onClick={() => data.onDelete?.(data.id)}
        >
          Delete Branch
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default memo(BranchNode);