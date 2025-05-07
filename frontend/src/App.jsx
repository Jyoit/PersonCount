import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/logs');
        setLogs(res.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch logs:', error.message);
        setError('Failed to fetch logs. Ensure the backend is running on http://localhost:5000.');
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const exportLogs = () => {
    window.open('http://localhost:5000/api/export');
  };

  return (
    <div className="p-4 flex flex-row gap-4">
      {/* Left: Video Section */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">Smart Attendance & Occupancy Tracker</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Always show video */}
        <div className="border w-full max-w-md h-[300px] overflow-hidden rounded">
          <img
            src="http://localhost:5000/video-feed"
            alt="Video Stream"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Right: Logs Table */}
      <div className="flex-1">
        <p className="text-lg mb-2">
          Live Count: {logs.length > 0 ? logs[logs.length - 1].count : 0}
        </p>
        <table className="mt-2 border-collapse border w-full">
          <thead>
            <tr>
              <th className="border p-2">Count</th>
              <th className="border p-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td className="border p-2">{log.count}</td>
                <td className="border p-2">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={exportLogs}
          className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}

export default App;
