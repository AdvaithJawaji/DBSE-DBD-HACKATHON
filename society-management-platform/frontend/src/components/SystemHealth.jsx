import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Server, Database, RefreshCw, CircleCheck, CircleX, Clock3 } from 'lucide-react';

const SystemHealth = ({ darkMode }) => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [checkedAt, setCheckedAt] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchHealth = async (initial = false) => {
      if (initial) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await axios.get('/health', { timeout: 5000 });
        if (active) {
          setHealth(res.data);
          setError('');
          setCheckedAt(new Date());
        }
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.detail || 'Unable to reach the API Gateway health endpoint.');
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchHealth(true);
    const interval = setInterval(() => fetchHealth(), 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [refreshKey]);

  const status = (value) => value === 'UP' ? 'UP' : value || 'UNKNOWN';
  const services = health ? [
    { name: 'API Gateway', value: health.gateway || 'UNKNOWN', icon: Activity },
    { name: 'Database', value: health.database || 'UNKNOWN', icon: Database },
    ...Object.entries(health.services || {}).map(([name, value]) => ({ name, value, icon: Server })),
  ] : [];
  const cardStyle = `p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'}`;
  const overallStatus = status(health?.status);
  const overallColor = overallStatus === 'UP' ? 'text-green-500' : overallStatus === 'DEGRADED' ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-lg shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className={`text-xl font-bold flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <Activity className="mr-2 text-blue-500" /> System Health
          </h3>
          <div className="flex items-center gap-3">
            {checkedAt && <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock3 className="w-3.5 h-3.5" /> Checked {checkedAt.toLocaleTimeString()}
            </span>}
            <button type="button" onClick={() => setRefreshKey(value => value + 1)} disabled={loading || refreshing}
              title="Refresh health checks" aria-label="Refresh health checks"
              className={`p-2 rounded-md disabled:opacity-50 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <p className={`py-8 text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Checking services and database...</p>
        ) : error ? (
          <div className={`p-4 rounded-lg border flex items-start gap-3 ${darkMode ? 'border-red-900 bg-red-950/30 text-red-200' : 'border-red-200 bg-red-50 text-red-800'}`} role="alert">
            <CircleX className="w-5 h-5 shrink-0 mt-0.5" />
            <div><p className="font-semibold">Health check unavailable</p><p className="text-sm mt-1">{error}</p></div>
          </div>
        ) : (
          <>
            <div className={`${cardStyle} mb-4 flex items-center justify-between gap-3`}>
              <div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Overall status</div>
                <div className={`text-lg font-bold ${overallColor}`}>{overallStatus}</div>
              </div>
              {overallStatus === 'UP' ? <CircleCheck className="w-6 h-6 text-green-500" /> : <CircleX className={`w-6 h-6 ${overallColor}`} />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {services.map(({ name, value, icon: Icon }) => {
                const isUp = value === 'UP';
                return (
                  <div key={name} className={`${cardStyle} flex justify-between items-center gap-3`}>
                    <div className="flex items-center min-w-0">
                      <Icon className={`w-4 h-4 mr-2 shrink-0 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`font-medium capitalize truncate ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold shrink-0 ${isUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;
