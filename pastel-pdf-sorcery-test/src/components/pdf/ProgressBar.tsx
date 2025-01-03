import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
  isLoading: boolean;
}

export const ProgressBar = ({ progress, isLoading }: ProgressBarProps) => {
  if (!isLoading) return null;

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 mb-2">
        {progress < 50 
          ? `Loading PDF file... ${Math.round(progress * 2)}%`
          : `Rendering pages... ${Math.round((progress - 50) * 2)}%`}
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
};