import React, { useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function LogsPage() {
  const [logs, setLogs] = React.useState([]);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/logs');
        setLogs(res.data.map(log => ({
          ...log,
          _id: log._id,
          count: log.count,
          timestamp: new Date(log.timestamp)
        })));
        setError(null);
      } catch (error) {
        console.error('Failed to fetch logs:', error.message);
        setError('Failed to fetch logs. Ensure the backend is running.');
      }
    };

    fetchLogs();

    const socket = io('http://localhost:5000');
    socket.on('new_log', () => {
      window.location.reload();
    });

    return () => socket.disconnect();
  }, []);

  const exportLogs = () => {
    window.open('http://localhost:5000/api/export');
  };

  const chartData = {
    labels: logs.map(log => log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
    datasets: [
      {
        label: 'Person Count Over Time',
        data: logs.map(log => log.count),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: '#10B981',
        borderWidth: 2
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: '#E5E7EB'
        }
      },
      title: { 
        display: true, 
        text: 'Person Count Over Time', 
        font: { size: 16 },
        color: '#E5E7EB'
      },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: '#374151',
        titleColor: '#10B981',
        bodyColor: '#E5E7EB'
      },
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'Time',
          color: '#9CA3AF'
        },
        ticks: { 
          maxTicksLimit: 10,
          color: '#9CA3AF'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      y: { 
        title: { 
          display: true, 
          text: 'Count',
          color: '#9CA3AF'
        },
        beginAtZero: true,
        suggestedMax: Math.max(...logs.map(log => log.count)) + 10 || 10,
        ticks: {
          color: '#9CA3AF'
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
    },
    animation: {
      duration: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Main Content - now flex-grow to push footer down */}
      <div className="flex-grow p-6">
        <div className="mx-auto bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700 min-h-[calc(100vh-200px)]">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-purple-300">
              Live Analytics Dashboard
            </h2>
            <p className="text-gray-400">
              Real-time monitoring of attendance and occupancy trends
            </p>
          </div>

          {/* Current Count and Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-red-300 text-center">
              {error}
            </div>
          )}
          
          <div className="bg-gray-700/50 rounded-lg p-4 mb-8 text-center border border-teal-400/20">
            <p className="text-gray-400 mb-1">Current Occupancy</p>
            <p className="text-4xl font-bold text-teal-300">
              {logs.length > 0 ? logs[logs.length - 1].count : 0}
            </p>
          </div>

          {/* Chart Section */}
          <div className="mb-10 h-80 bg-gray-700/30 rounded-xl p-4 border border-gray-600">
            <Line data={chartData} options={chartOptions} />
          </div>

          {/* Export Button */}
          <div className="mb-8 text-center">
            <button
              onClick={exportLogs}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-lg hover:shadow-purple-500/20"
            >
              Export Data (CSV)
            </button>
            <p className="text-gray-500 mt-3 text-sm">
              Export for detailed analysis in spreadsheet tools
            </p>
          </div>
        </div>
      </div>

      {/* Footer - now at bottom */}
      <div className="text-center text-gray-500 text-sm border-t border-gray-800 py-6 bg-gray-900/50">
        <p>© 2025 VisionTrack Pro | YOLOv8 + OpenCV + React | AWS Cloud Deployment</p>
      </div>
    </div>
  );
}

export default LogsPage;