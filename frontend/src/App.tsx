import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid 
} from 'recharts';

const FEATURE_NAMES = ['MQ6', 'MQ4', 'TGS2620', 'MQ5', 'MQ2', 'TGS2602', 'MQ7', 'MQ3', 'MQ135', 'MQ138'];

function App() {
  const [inputs, setInputs] = useState(Array(10).fill(0.5));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Automatically fetch prediction and XAI on load with default sample data
  useEffect(() => {
    const fetchInitialPrediction = async () => {
      setLoading(true);
      try {
        const response = await axios.post('https://enose-backend-gn0a.onrender.com/predict-and-explain', { data: inputs });
        const { prediction, feature_names, shap_values } = response.data;
        
        const shapData = feature_names.map((name: string, i: number) => ({
          name,
          value: shap_values[i]
        }));

        setResult({
          prediction,
          shapData
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch initial prediction on load.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPrediction();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('https://enose-backend-gn0a.onrender.com/predict-and-explain', { data: inputs });
      const { prediction, feature_names, shap_values } = response.data;
      
      const shapData = feature_names.map((name: string, i: number) => ({
        name,
        value: shap_values[i]
      }));

      setResult({
        prediction,
        shapData
      });
    } catch (err) {
      console.error(err);
      setError('Failed to reach API. Please check your connection or backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', fontFamily: 'system-ui, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#4F46E5', color: 'white', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold' }}>EN</div>
          <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>E-Nose Insight & XAI</span>
        </div>
        <div>
          <a href="https://enose-backend-gn0a.onrender.com/docs" target="_blank" rel="noreferrer" style={{ color: '#4F46E5', textDecoration: 'none', fontWeight: '600' }}>API Docs ↗</a>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '32px' }}>
          
          {/* Input Section */}
          <div>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px' }}>Sensor Inputs</h2>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  {inputs.map((val, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>
                        {FEATURE_NAMES[i]}
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={val}
                        style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none' }}
                        onChange={(e) => {
                          const newInputs = [...inputs];
                          newInputs[i] = parseFloat(e.target.value) || 0;
                          setInputs(newInputs);
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ width: '100%', background: '#4F46E5', color: 'white', fontWeight: 'bold', padding: '14px', borderRadius: '8px', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Analyzing Sample...' : 'Analyze & Explain'}
                </button>
              </form>
            </div>

            {error && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '16px', borderRadius: '8px', marginTop: '16px', fontSize: '14px' }}>
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {!result && !loading ? (
              <div style={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'white', borderRadius: '16px', border: '2px dashed #E2E8F0', padding: '40px', color: '#64748B' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '8px' }}>Ready for analysis</h3>
                <p style={{ fontSize: '14px', maxWidth: '280px' }}>Enter sensor data on the left to get AI-powered odor classification and feature explanations.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
                {/* Prediction Card */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to right, #ffffff, #EEF2FF)' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Classification Result</p>
                    <h2 style={{ fontSize: '3rem', fontWeight: '900', color: '#312E81', margin: 0 }}>
                      Grade <span style={{ color: '#4F46E5' }}>{result?.prediction}</span>
                    </h2>
                  </div>
                </div>

                {/* XAI Chart Card */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>Feature Explanation (SHAP)</h3>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', background: '#EEF2FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '4px' }}>XAI POWERED</span>
                  </div>
                  
                  <div style={{ height: '320px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={result?.shapData} 
                        layout="vertical"
                        margin={{ left: 20, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={70}
                          style={{ fontSize: '12px', fontWeight: 'bold', fill: '#64748B' }}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div style={{ background: 'white', padding: '10px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                  <p style={{ fontWeight: 'bold', margin: 0 }}>{payload[0].payload.name}</p>
                                  <p style={{ color: '#4F46E5', margin: '4px 0 0 0', fontFamily: 'monospace' }}>Value: {Number(payload[0].value).toFixed(4)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[0, 4, 4, 0]}
                          barSize={20}
                        >
                          {result?.shapData.map((entry: any, index: number) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.value > 0 ? '#4F46E5' : '#EC4899'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', fontSize: '11px', fontWeight: 'bold', color: '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', background: '#4F46E5', borderRadius: '2px' }}></div>
                      <span>POSITIVE INFLUENCE</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', background: '#EC4899', borderRadius: '2px' }}></div>
                      <span>NEGATIVE INFLUENCE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
