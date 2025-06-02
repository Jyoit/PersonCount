
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function VideoFeed() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const runPythonScript = () => {
    setIsLoading(true);
    fetch("http://127.0.0.1:5000/run-python-script")
      .then(response => response.json())
      .then(data => {
        setIsLoading(false);
        if (data.success) {
          navigate('/logs');
        } else {
          alert("Failed to start the Python script.");
        }
      })
      .catch(error => {
        setIsLoading(false);
        console.error("Error:", error);
        alert("An error occurred while starting the Python script.");
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-indigo-800 py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="text-5xl mb-4">  </div>
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-teal-300">
            Count Person
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            AI-powered attendance tracking with real-time analytics
          </p>
        </div>
      </header>

      {/* Main Content - flex-grow to push footer down */}
      <main className="flex-grow max-w-6xl mx-auto px-4 py-12">
        {/* Hero Card - Now with minimum height */}
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden mb-12 p-8 text-center min-h-[300px] flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4 text-teal-300">
            Intelligent People Counting
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Harnessing YOLOv8 and OpenCV to deliver 95% accurate real-time occupancy data for classrooms, offices, and retail spaces.
          </p>
          <div className="flex justify-center">
            <button
              onClick={runPythonScript}
              disabled={isLoading}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-purple-500/20'
              }`}
            >
              ▶️ {isLoading ? 'Initializing...' : 'Launch Detection'}
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-12 text-teal-300">
            <span className="border-b-2 border-teal-400/30 pb-2 px-8">
              System Capabilities
            </span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Real-Time Processing",
                desc: "60 FPS video analysis with <33ms latency",
                color: "from-amber-500/10 to-amber-500/5"
              },
              {
                icon: "📈",
                title: "Advanced Analytics",
                desc: "Entry/exit patterns and heatmap generation",
                color: "from-teal-500/10 to-teal-500/5"
              },
              {
                icon: "☁️",
                title: "Cloud Ready",
                desc: "AWS-deployable with auto-scaling",
                color: "from-purple-500/10 to-purple-500/5"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className={`bg-gradient-to-br ${feature.color} border border-gray-700 rounded-xl p-6 hover:border-teal-400/30 transition-all`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center text-teal-300">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1️⃣",
                title: "Launch Detection",
                desc: "Start the YOLOv8 tracking system"
              },
              {
                step: "2️⃣",
                title: "Real-Time Analysis",
                desc: "AI processes video feed continuously"
              },
              {
                step: "3️⃣",
                title: "View Insights",
                desc: "Access logs and analytics dashboard"
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="text-xl mt-1">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-medium text-gray-100">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer - now at bottom */}
      <footer className="bg-gray-800/50 py-8 text-center text-gray-400 text-sm border-t border-gray-700">
        <p>© 2025 VisionTrack Pro | YOLOv8 + OpenCV + React | AWS Cloud Deployment</p>
      </footer>
    </div>
  );
}

export default VideoFeed;