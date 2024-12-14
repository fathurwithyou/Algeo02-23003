import React from "react";

interface ProgressProps {
  value: number;
  max?: number;
}

const Progress: React.FC<ProgressProps> = ({ value, max = 100 }) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-1">
      <div
        className="bg-blue-600 h-1 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default Progress;
