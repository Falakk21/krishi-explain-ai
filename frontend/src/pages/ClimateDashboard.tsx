import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import {
  Filter, Calendar, MapPin, Sprout, TrendingUp, CloudRain, Thermometer,
  ShieldAlert, RefreshCw, Info, AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { ClimateSeriesResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

const PUNJAB_DISTRICTS = [
  "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib",
  "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar",
  "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar",
  "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "S.A.S Nagar",
  "Sangrur", "Tarn Taran"
];

export const ClimateDashboard: React.FC = () => {
  const [district, setDistrict] = useState<string>("Ludhiana");
  const [startYear, setStartYear] = useState<number>(1997);
  const [endYear, setEndYear] = useState<number>(2014);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ClimateSeriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSeries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getClimateSeries(district, startYear, endYear);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load climate analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, [district, startYear, endYear]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sage/30">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Agro-Meteorology Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-forest-dark tracking-tight">
            Climate & Agricultural Trends Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            NASA POWER climate and Punjab Rabi wheat yield records from a public APY mirror for 22 districts (1997–2014).
          </p>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="bg-white p-5 rounded-2xl border border-sage/40 shadow-card">
        <div className="flex items-center gap-2 mb-3 text-xs font-bold text-forest-dark uppercase tracking-wider">
          <Filter className="w-4 h-4 text-forest" />
          <span>Analytics Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Country / State (Locked to Punjab benchmark) */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Country & State</label>
            <div className="px-3 py-2 rounded-xl bg-cream border border-sage/40 text-xs font-semibold text-charcoal">
              India • Punjab
            </div>
          </div>

          {/* District Selector */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-sage/50 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <option value="all">All Districts (State Average)</option>
              {PUNJAB_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Crop & Season</label>
            <div className="px-3 py-2 rounded-xl bg-cream border border-sage/40 text-xs font-semibold text-charcoal flex items-center justify-between">
              <span>Wheat (Triticum aestivum)</span>
              <span className="text-[10px] bg-mint px-1.5 py-0.5 rounded text-forest font-bold">Rabi</span>
            </div>
          </div>

          {/* Time Period Range */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Time Horizon (Years)</label>
            <div className="flex items-center gap-2">
              <select
                value={startYear}
                onChange={(e) => setStartYear(Number(e.target.value))}
                className="w-1/2 px-2 py-2 rounded-xl bg-white border border-sage/50 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
              >
                {[1997, 2000, 2005, 2010].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="text-xs text-muted">to</span>
              <select
                value={endYear}
                onChange={(e) => setEndYear(Number(e.target.value))}
                className="w-1/2 px-2 py-2 rounded-xl bg-white border border-sage/50 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-forest"
              >
                {[2000, 2005, 2010, 2014].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Loading & Error States */}
      {loading && <LoadingSpinner message="Fetching district agro-climatic time series..." />}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-risk text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content when loaded */}
      {!loading && data && data.series.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-charcoal text-sm">
          No observed records are available for this district and year range. Choose years between 1997 and 2014.
        </div>
      )}
      {!loading && data && data.series.length > 0 && (
        <>
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>Selected Crop & Region</span>
                <Sprout className="w-4 h-4 text-forest" />
              </div>
              <div className="text-lg font-extrabold text-forest-dark">{data.kpis.selected_crop}</div>
              <div className="text-xs text-muted font-medium mt-1">{data.kpis.selected_region}</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>Historical Temp Trend</span>
                <Thermometer className="w-4 h-4 text-warning" />
              </div>
              <div className="text-lg font-extrabold text-warning">{data.kpis.historical_temp_trend}</div>
              <div className="text-xs text-muted font-medium mt-1">First-to-last selected year difference</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>Latest Observed Yield</span>
                <TrendingUp className="w-4 h-4 text-forest" />
              </div>
              <div className="text-lg font-extrabold text-forest-dark">{data.kpis.latest_observed_yield}</div>
              <div className="text-xs text-muted font-medium mt-1">Regional Avg: {data.kpis.historical_mean_yield}</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-sage/40 shadow-subtle">
              <div className="flex items-center justify-between text-muted text-xs mb-1">
                <span>Assessment Status</span>
                <ShieldAlert className="w-4 h-4 text-forest" />
              </div>
              <div className="text-lg font-extrabold text-forest-dark">
                Observed Records
              </div>
              <div className="text-xs text-muted font-medium mt-1">{data.kpis.total_records} yearly data points</div>
            </div>

          </div>

          {/* Interactive Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Chart A: Temperature Trends */}
            <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-card space-y-4">
              <div>
                <h3 className="font-bold text-base text-forest-dark">A. Growing Season Temperature (°C)</h3>
                <p className="text-xs text-muted">
                  Mean Rabi temperature vs. Peak / March terminal grain-filling temperature.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis unit="°C" domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} °C`, '']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #A8C3A0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="avg_temperature"
                      name="Mean Rabi Temp"
                      stroke="#174D38"
                      strokeWidth={2.5}
                      dot={{ r: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="max_temperature"
                      name="Peak March Temp"
                      stroke="#D97706"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted italic">
                Notice the March 2022 heat spike reaching &gt;32°C during grain milking.
              </p>
            </div>

            {/* Chart B: Seasonal Rainfall Pattern */}
            <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-card space-y-4">
              <div>
                <h3 className="font-bold text-base text-forest-dark">B. Cumulative Rabi Rainfall (mm)</h3>
                <p className="text-xs text-muted">
                  Total winter precipitation (Nov–Mar) from Western Disturbances.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis unit="mm" tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} mm`, 'Rainfall']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #A8C3A0', fontSize: '12px' }}
                    />
                    <Bar dataKey="rainfall_mm" name="Rabi Rainfall (mm)" fill="#23654B" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted italic">
                Optimal Punjab Rabi range: 75–140 mm. 2015 experienced excess unseasonal March rainfall (&gt;200 mm).
              </p>
            </div>

            {/* Chart C: Historical Crop Yield Trend */}
            <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-card space-y-4">
              <div>
                <h3 className="font-bold text-base text-forest-dark">C. Historical Wheat Yield (t/ha)</h3>
                <p className="text-xs text-muted">
                  Observed crop productivity documented by the Directorate of Economics and Statistics.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#174D38" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#174D38" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis unit=" t/ha" domain={[2.5, 6.0]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} t/ha`, 'Wheat Yield']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #A8C3A0', fontSize: '12px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="yield_tonnes_per_hectare"
                      name="Wheat Yield (t/ha)"
                      stroke="#103C2C"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#yieldGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted italic">
                Punjab achieved peak yields in 2018–2019 (~5.1 t/ha), followed by a notable climate-induced drop in 2022.
              </p>
            </div>

            {/* Chart D: Multi-Variable Comparison */}
            <div className="p-6 rounded-2xl bg-white border border-sage/40 shadow-card space-y-4">
              <div>
                <h3 className="font-bold text-base text-forest-dark">D. Agro-Environmental Moisture Comparison</h3>
                <p className="text-xs text-muted">
                  Relative Humidity (%) and Root-Zone Soil Moisture (%) dynamics.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis unit="%" domain={[20, 90]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any) => [`${val} %`, '']}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #A8C3A0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line
                      type="monotone"
                      dataKey="humidity_pct"
                      name="Relative Humidity (%)"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="soil_moisture_pct"
                      name="Soil Moisture (%)"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-muted italic">
                Healthy soil moisture (35–55%) provides buffer capacity against transient heat shocks.
              </p>
            </div>

          </div>

          {/* Agricultural Risk Overview Banner */}
          <div className="p-5 rounded-2xl bg-mint/50 border border-sage/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-forest-dark">Ready to run a customized crop impact prediction?</h4>
                <p className="text-xs text-charcoal/80">
                  Explore how specific climate changes (e.g. +2°C heat or -25% rain) may affect wheat yield and its contributing factors.
                </p>
              </div>
            </div>
            <a
              href="/assessment"
              className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold whitespace-nowrap shadow-subtle"
            >
              Start Impact Assessment
            </a>
          </div>
        </>
      )}

    </div>
  );
};
