import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from 'recharts';

const RainForecastChart = ({ data = [] }) => {
  if (!data.length) {
    return (
      <div className="text-center text-gray-500 py-4">
        📉 No rain forecast data available.
      </div>
    );
  }

  return (
    <div className="w-full h-60">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, bottom: 10, left: 0 }}>
          <CartesianGrid stroke="#e0e0e0" strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            label={{ value: 'Time', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis
            unit=" mm"
            domain={[0, 'auto']}
            label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip formatter={(value) => `${value} mm`} />
          <Line
            type="monotone"
            dataKey="rain"
            stroke="#42a5f5"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#42a5f5', stroke: '#1976d2' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RainForecastChart;
