import React, { useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid 
} from 'recharts';
import { Activity, Thermometer, Info, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

const FEATURE_NAMES = ['MQ6', 'MQ4', 'TGS2620', 'MQ5', 'MQ2', 'TGS2602', 'MQ7', 'MQ3', 'MQ135', 'MQ138'];

function App() {
  const [inputs, setInputs] = useState(Array(10).fill(0));
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
      setError('Failed to reach API. Please check your connection or backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Activity className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-800">E-Nose Insight</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-indigo-600 transition">Dashboard</a>
          <a href="#" className="hover:text-indigo-600 transition">API Docs</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Thermometer className="text-indigo-600 w-5 h-5" />
                <h2 className="font-bold text-lg text-gray-800">Sensor Inputs</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {inputs.map((val, i) => (
                    <div key={i} className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                        {FEATURE_NAMES[i]}
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={val}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Analyze Sample <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-7">
            {!result && !loading ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                  <Info className="text-gray-400 w-8 h-8" />
                </div>
                <h3 className="text-gray-800 font-bold text-xl mb-2">Ready for analysis</h3>
                <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
                  Enter sensor data on the left to get AI-powered odor classification and feature explanations.
                </p>
              </div>
            ) : (
              <div className={`space-y-6 transition-all duration-500 ${loading ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                {/* Prediction Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/30">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Classification Result</p>
                    <h2 className="text-5xl font-black text-indigo-900 tracking-tighter">
                      Grade <span className="text-indigo-600">{result?.prediction}</span>
                    </h2>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-indigo-600">{result?.prediction}</span>
                    </div>
                  </div>
                </div>

                {/* XAI Chart Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Activity className="text-indigo-600 w-5 h-5" />
                      <h3 className="font-bold text-lg text-gray-800">Feature Explanation (SHAP)</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">XAI POWERED</span>
                  </div>
                  
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={result?.shapData} 
                        layout="vertical"
                        margin={{ left: 20, right: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          width={80}
                          style={{ fontSize: '12px', fontWeight: 'bold', fill: '#64748B' }}
                        />
                        <Tooltip 
                          cursor={{ fill: 'transparent' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white shadow-xl border rounded-lg p-3 text-xs">
                                  <p className="font-bold text-gray-800">{payload[0].payload.name}</p>
                                  <p className="text-indigo-600 mt-1 font-mono">Value: {payload[0].value.toFixed(4)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[0, 4, 4, 0]}
                          barSize={24}
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
                  <div className="mt-4 flex justify-center gap-6 text-[10px] font-bold text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-[#4F46E5] rounded-sm"></div>
                      <span>POSITIVE INFLUENCE</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-[#EC4899] rounded-sm"></div>
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
