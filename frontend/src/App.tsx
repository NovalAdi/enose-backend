import React, { useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [inputs, setInputs] = useState(Array(10).fill(0));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const predRes = await axios.post('https://enose-backend-gn0a.onrender.com/predict', { data: inputs });
      const expRes = await axios.post('https://enose-backend-gn0a.onrender.com/explain', { data: inputs });
      
      const shapData = expRes.data.feature_names.map((name: string, i: number) => ({
        name,
        value: expRes.data.shap_values[i]
      }));

      setResult({
        prediction: predRes.data.prediction,
        shapData
      });
    } catch (err) {
      console.error(err);
      alert('Error processing request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">E-Nose Predictor</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-8">
        {inputs.map((_, i) => (
          <input
            key={i}
            type="number"
            step="0.01"
            placeholder={`Sensor ${i + 1}`}
            className="border p-2"
            onChange={(e) => {
              const newInputs = [...inputs];
              newInputs[i] = parseFloat(e.target.value);
              setInputs(newInputs);
            }}
          />
        ))}
        <button type="submit" className="bg-blue-500 text-white p-2 col-span-2" disabled={loading}>
          {loading ? 'Predicting...' : 'Predict & Explain'}
        </button>
      </form>

      {result && (
        <div>
          <h2 className="text-xl font-semibold">Prediction: {result.prediction}</h2>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.shapData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
