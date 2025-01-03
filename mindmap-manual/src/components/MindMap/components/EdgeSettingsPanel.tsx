import { useState } from 'react';
import { Edge } from '@xyflow/react';
import { cn } from '@/lib/utils';

interface EdgeSettingsPanelProps {
  edge: Edge | null;
  onSettingsChange: (settings: {
    strokeWidth?: number;
    cornerRadius?: number;
    startArrow?: string;
    endArrow?: string;
    opacity?: number;
  }) => void;
  position: { x: number; y: number } | null;
}

const arrowTypes = [
  { id: 'none', label: '⚊', icon: '—' },
  { id: 'arrow', label: '→', icon: '→' },
  { id: 'diamond', label: '◆', icon: '◆' },
];

export const EdgeSettingsPanel = ({
  edge,
  onSettingsChange,
  position,
}: EdgeSettingsPanelProps) => {
  const [strokeWidth, setStrokeWidth] = useState(edge?.style?.strokeWidth || 1);
  const [startArrow, setStartArrow] = useState(edge?.markerStart?.type || 'none');
  const [endArrow, setEndArrow] = useState(edge?.markerEnd?.type || 'none');
  const [opacity, setOpacity] = useState((edge?.style?.opacity || 1) * 100);

  if (!edge || !position) return null;

  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg p-4 min-w-[200px] z-50"
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      {/* Line Weight */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Line Weight</label>
        <input
          type="range"
          min="1"
          max="10"
          value={strokeWidth}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setStrokeWidth(value);
            onSettingsChange({ strokeWidth: value });
          }}
          className="w-full"
        />
      </div>

      {/* Start Arrow */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Start Arrow</label>
        <div className="flex gap-2">
          {arrowTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setStartArrow(type.id);
                onSettingsChange({ startArrow: type.id });
              }}
              className={cn(
                'w-8 h-8 flex items-center justify-center border rounded',
                startArrow === type.id ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
              )}
            >
              {type.icon}
            </button>
          ))}
        </div>
      </div>

      {/* End Arrow */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">End Arrow</label>
        <div className="flex gap-2">
          {arrowTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => {
                setEndArrow(type.id);
                onSettingsChange({ endArrow: type.id });
              }}
              className={cn(
                'w-8 h-8 flex items-center justify-center border rounded',
                endArrow === type.id ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
              )}
            >
              {type.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label className="block text-sm font-medium mb-1">Opacity</label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            setOpacity(value);
            onSettingsChange({ opacity: value / 100 });
          }}
          className="w-full"
        />
      </div>
    </div>
  );
};
