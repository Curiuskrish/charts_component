import React, { useState } from 'react';
import MoistureBar from './Charts/MoistureBar';
import WaterBudgetGauge from './Charts/WaterBudgetGauge';
import RainForecastChart from './Charts/RainForecastChart';

const OPENWEATHER_API_KEY = 'fd88a3af22ad8939d2f71e16259f7e5d';
const GEMINI_API_KEY = 'AIzaSyCK5JrpotZfBivBio41KVw9M7uU5UkmK_c';

const cropWaterTable = {
  wheat: { min: 4000, max: 6000, optimalMoisture: 60 },
  rice: { min: 10000, max: 15000, optimalMoisture: 70 },
  maize: { min: 6000, max: 8000, optimalMoisture: 55 },
};

const IrrigationPlanner = () => {
  const [location, setLocation] = useState({ lat: '', lon: '' });
  const [crop, setCrop] = useState('');
  const [soilMoisture, setSoilMoisture] = useState('');
  const [farmSize, setFarmSize] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [rainForecastData, setRainForecastData] = useState([]);
  const [loading, setLoading] = useState(false);

  const getWeather = async () => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();
      const sliced = data.list.slice(0, 5); // Next 5 intervals (3hr each)
      
      const rainForecast = sliced.reduce((total, entry) => {
        const rain = entry.rain?.['3h'] || 0;
        return total + rain;
      }, 0);

      const chartData = sliced.map((entry) => ({
        time: new Date(entry.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rain: entry.rain?.['3h'] || 0,
      }));

      setRainForecastData(chartData);
      return rainForecast;
    } catch {
      throw new Error('Failed to fetch weather data.');
    }
  };

  const askGemini = async (question) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }],
        }),
      });

      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, no explanation provided.';

      const lower = raw.toLowerCase();
      const decision = lower.includes('yes') && !lower.includes('no') ? '✅ Yes'
                      : lower.includes('no') && !lower.includes('yes') ? '❌ No'
                      : '⚠️ Unclear';

      return {
        explanation: raw,
        decision,
      };
    } catch (err) {
      console.error('Gemini API error:', err);
      throw new Error('Failed to fetch AI advice.');
    }
  };

  const calculateWaterNeeds = (crop, soilMoisture, rain, farmSize) => {
    const cropData = cropWaterTable[crop.toLowerCase()];
    if (!cropData || !farmSize) return null;

    const avgWaterPerAcre = (cropData.min + cropData.max) / 2;
    const soilFactor = (100 - soilMoisture) / 100;
    const rainFactor = Math.max(0, 1 - rain / 10);

    const finalPerAcre = avgWaterPerAcre * soilFactor * rainFactor;
    const total = finalPerAcre * farmSize;

    return {
      perAcre: Math.round(finalPerAcre),
      total: Math.round(total),
      min: cropData.min,
      max: cropData.max,
      optimalMoisture: cropData.optimalMoisture,
    };
  };

  const handlePlanIrrigation = async () => {
    setRecommendation(null);

    if (!location.lat || !location.lon || !crop || !soilMoisture) {
      setRecommendation({ error: '🚫 Please fill all required fields.' });
      return;
    }

    setLoading(true);
    try {
      const rain = await getWeather();
      const prompt = `Should I irrigate today for ${crop}? Soil moisture is ${soilMoisture}%, forecasted rain is ${rain.toFixed(1)}mm. Answer with yes or no and explain why.`;
      const aiResponse = await askGemini(prompt);

      const waterEstimation = calculateWaterNeeds(
        crop,
        parseFloat(soilMoisture),
        parseFloat(rain),
        parseFloat(farmSize || 0)
      );

      setRecommendation({
        rain: rain.toFixed(1),
        shouldIrrigate: aiResponse.decision,
        explanation: aiResponse.explanation,
        waterEstimate: waterEstimation,
      });
    } catch (error) {
      setRecommendation({ error: error.message || 'Unexpected error occurred.' });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-2xl shadow-md space-y-4 font-sans">
      <h2 className="text-3xl font-bold text-blue-800">💧 Irrigation Planner</h2>

      <div className="space-y-2">
        <input
          type="number"
          placeholder="Latitude"
          className="w-full p-2 border rounded"
          value={location.lat}
          onChange={(e) => setLocation({ ...location, lat: e.target.value })}
        />
        <input
          type="number"
          placeholder="Longitude"
          className="w-full p-2 border rounded"
          value={location.lon}
          onChange={(e) => setLocation({ ...location, lon: e.target.value })}
        />
        <input
          type="text"
          placeholder="Crop Type (e.g., wheat)"
          className="w-full p-2 border rounded"
          value={crop}
          onChange={(e) => setCrop(e.target.value)}
        />
        <input
          type="number"
          placeholder="Soil Moisture (%)"
          className="w-full p-2 border rounded"
          value={soilMoisture}
          onChange={(e) => setSoilMoisture(e.target.value)}
        />
        <input
          type="number"
          placeholder="Farm Size (acres) [optional]"
          className="w-full p-2 border rounded"
          value={farmSize}
          onChange={(e) => setFarmSize(e.target.value)}
        />
      </div>

      <button
        onClick={handlePlanIrrigation}
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? 'Calculating...' : 'Plan Irrigation'}
      </button>

      {recommendation && (
        <div className="mt-4 p-4 bg-gray-50 rounded space-y-4 text-sm">
          {recommendation.error ? (
            <p className="text-red-600 font-semibold">{recommendation.error}</p>
          ) : (
            <>
              <p><strong>🌧 Forecasted Rain:</strong> {recommendation.rain} mm</p>
              <p><strong>🚿 Should Irrigate?</strong> {recommendation.shouldIrrigate}</p>
              <p><strong>🧠 Reason:</strong> {recommendation.explanation}</p>

              {recommendation.waterEstimate && (
                <div className="grid gap-4">
                  <div className="bg-blue-50 rounded p-2 border border-blue-200">
                    <p><strong>💦 Water Requirement:</strong></p>
                    <ul className="list-disc ml-5">
                      <li><strong>Per Acre:</strong> {recommendation.waterEstimate.perAcre.toLocaleString()} litres</li>
                      <li><strong>Total:</strong> {recommendation.waterEstimate.total.toLocaleString()} litres</li>
                    </ul>
                  </div>

                  <WaterBudgetGauge min={recommendation.waterEstimate.min} max={recommendation.waterEstimate.max} />
                  <MoistureBar
                    moisture={parseFloat(soilMoisture)}
                    optimal={recommendation.waterEstimate.optimalMoisture}
                    rain={parseFloat(recommendation.rain)}
                  />
                  <RainForecastChart data={rainForecastData} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IrrigationPlanner;
