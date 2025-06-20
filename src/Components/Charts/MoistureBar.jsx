import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const MoistureBar = ({ soilMoisture, optimal }) => {
  const data = [
    { name: 'Soil', moisture: soilMoisture },
    { name: 'Optimal', moisture: optimal },
  ];

  const getBarColor = (name) => {
    return name === 'Soil' ? '#00bcd4' : '#4caf50'; // Blue for soil, green for optimal
  };

  return (
    <div className="w-full h-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
          <XAxis dataKey="name" />
          <YAxis unit="%" domain={[0, 100]} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Bar
            dataKey="moisture"
            name="Moisture Level"
            isAnimationActive={true}
          >
            <LabelList dataKey="moisture" position="top" formatter={(value) => `${value}%`} />
            {data.map((entry, index) => (
              <cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoistureBar;
