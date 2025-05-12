// import React from 'react';
// import { Link } from 'react-router-dom';

// function VideoFeed() {
//   return (
//     <div className="min-h-screen bg-gradient-to-r from-pink-300 to-pink-500 p-6">
//       <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
//         <h1 className="text-4xl font-bold text-center text-indigo-700 mb-6">
//           Smart Attendance & Occupancy Tracker
//         </h1>
//         <div className="w-full h-72 bg-gray-200 rounded-lg overflow-hidden">
//           <img
//             src="http://localhost:5000/video-feed"
//             alt="Live camera feed"
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <Link to="/logs">
//           <button className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300">
//             Go to Live Count
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }

// export default VideoFeed;















import React from 'react';
import { Link } from 'react-router-dom';

function VideoFeed() {
  const runPythonScript = () => {
    // Use the 'fetch' API to call the backend endpoint that triggers the Python script
    fetch("http://127.0.0.1:5000/run-python-script")
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Python script is running. The video stream should appear.");
        } else {
          alert("Failed to start the Python script.");
        }
      })
      .catch(error => {
        console.error("Error starting Python script:", error);
        alert("An error occurred while starting the Python script.");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-300 to-pink-500 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-6">
          Smart Attendance & Occupancy Tracker
        </h1>
        
        {/* Button to run the Python script for starting the video stream */}
        <button
          onClick={runPythonScript}
          className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Start Video Stream
        </button>

        <Link to="/logs">
          <button className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300">
            Go to Live Count
          </button>
        </Link>
      </div>
    </div>
  );
}

export default VideoFeed;
