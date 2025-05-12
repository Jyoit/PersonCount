import React, { useState, useEffect } from 'react';
import axios from 'axios';

function LogsPage() {
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
    <div className="min-h-screen bg-gradient-to-r from-pink-300 ">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h2 className="text-3xl text-center text-indigo-700 mb-4">Live Count</h2>
        {error && (
          <p className="text-red-500 text-center mb-4 px-4 py-2 border border-red-500 rounded-lg">
            {error}
          </p>
        )}
        <p className="text-xl text-center text-indigo-600 mb-6">
          Live Count: {logs.length > 0 ? logs[logs.length - 1].count : 0}
        </p>
        <table className="min-w-full table-auto bg-gray-50 rounded-lg">
          <thead>
            <tr className="bg-indigo-600 text-white">
              <th className="px-6 py-3 text-left">Count</th>
              <th className="px-6 py-3 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index} className="border-t hover:bg-gray-100">
                <td className="px-6 py-4">{log.count}</td>
                <td className="px-6 py-4">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={exportLogs}
          className="mt-6 w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}

export default LogsPage;