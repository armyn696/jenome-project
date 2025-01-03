import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlusCircle } from 'lucide-react';
import { CenterNodeData } from './types';

const CenterNode = ({ data }: { data: CenterNodeData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);

  const handleAddBranch = (direction: 'left' | 'right', e: React.MouseEvent) => {
    // Stop the event from bubbling up and prevent node selection
    e.stopPropagation();
    e.preventDefault();
    
    // Call the onAddBranch function
    data.onAddBranch?.(data.id, direction);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-center min-w-[200px] bg-white rounded-lg shadow-md border border-gray-200 p-4">
        {isEditing ? (
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="w-full text-center border-none outline-none"
            autoFocus
          />
        ) : (
          <div onClick={() => setIsEditing(true)} className="cursor-text">
            {label}
          </div>
        )}
      </div>
     
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="w-2 h-2 !bg-blue-500 !opacity-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="w-2 h-2 !bg-blue-500 !opacity-0"
      />
     
      {/* Left plus button with enhanced click handling */}
      <div
        className="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => handleAddBranch('left', e)}
        onMouseDown={(e) => e.stopPropagation()} // Prevent selection on mousedown
        role="button"
        tabIndex={0}
      >
        <PlusCircle className="w-6 h-6 text-blue-500 hover:text-blue-600" />
      </div>
     
      {/* Right plus button with enhanced click handling */}
      <div
        className="absolute right-0 top-1/2 translate-x-12 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => handleAddBranch('right', e)}
        onMouseDown={(e) => e.stopPropagation()} // Prevent selection on mousedown
        role="button"
        tabIndex={0}
      >
        <PlusCircle className="w-6 h-6 text-blue-500 hover:text-blue-600" />
      </div>
    </div>
  );
};

export default memo(CenterNode);