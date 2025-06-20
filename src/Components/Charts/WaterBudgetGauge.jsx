import React from 'react';

const WaterBudgetGauge = ({ min, max, actual }) => {
  if (
    typeof min !== 'number' ||
    typeof max !== 'number' ||
    typeof actual !== 'number'
  ) {
    return <p className="text-red-500 font-semibold">No water data available.</p>;
  }

  const percent = Math.min(100, Math.round((actual / max) * 100));
  const percentColor =
    percent < 50 ? 'bg-red-500' : percent < 85 ? 'bg-yellow-400' : 'bg-green-500';

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm text-gray-700">💧 Water Use vs Max Budget ({percent}%)</p>
      <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${percentColor}`}
          style={{ width: `${percent}%`, transition: 'width 0.3s ease-in-out' }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Min: {min.toLocaleString()}L</span>
        <span>Actual: {actual.toLocaleString()}L</span>
        <span>Max: {max.toLocaleString()}L</span>
      </div>
    </div>
  );
};

export default WaterBudgetGauge;
