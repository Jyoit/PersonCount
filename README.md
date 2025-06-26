This AI-powered full-stack system combines real-time Computer Vision with a cloud-connected web dashboard to automate occupancy tracking. Using YOLOv8 and OpenCV, it counts people entering and exiting a space, announces changes via voice alerts (pyttsx3), and visualizes the live and historical data on a responsive Next.js interface. Built with privacy in mind (no facial recognition), it addresses key operational challenges like safety compliance, space optimization, and analytics.

This project addresses inefficiencies in manual counting by automating real-time space tracking. Applications include:

Retail & Malls: Track customer foot traffic and peak hours. 

Event Venues: Monitor attendee count and crowd density for safety. 

Schools & Universities: Count people in cafeterias, labs, or lecture halls for capacity. 

Smart Cities: Analyze general foot traffic patterns in public areas.

## System Architecture

Architecture Overview:

Camera Input → YOLOv8 AI Module (Python) → Flask Bridge → Node.js API → MongoDB → Next.js Frontend



## Technologies Used

AI: Python, YOLOv8, OpenCV, pyttsx3, FlaskBackend: Node.js, Express.js, Socket.IODatabase: MongoDB AtlasFrontend: React.js, Chart.js

## Setup & Installation
     

** Prerequisites**

Python 3.8+, pip

Node.js 16+, npm or Yarn

Git, MongoDB Atlas, Netlify, Render

Webcam (for local detection)

Clone the Repository

git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

MongoDB Setup

Create a free cluster in MongoDB Atlas

Add database user and IP whitelist

Copy your connection URI into .env or Render config as MONGO_URI

Backend Setup 

cd backend
npm install

Frontend Setup 

cd ../frontend
npm install

Python AI Setup

cd ../ppython
pip install -r requirements.txt  # Or install individually

Update ppython/config.ini with your backend API URL.

Running the Project

To see the full system in action (all components running locally):

Start MongoDB: Ensure your local MongoDB Community Server instance is running. (e.g., mongod command).

Start Node.js Backend:

Open a new terminal/command prompt window.

Navigate to the backend/ directory.

Run: npm start (or node server.js if your package.json doesn't define a start script).

You should see messages indicating the backend is listening, e.g., on http://localhost:5001.

Start Next.js Frontend:

Open another new terminal/command prompt window.

Navigate to the frontend/ directory.

Run: npm run dev

This will typically start the frontend development server on http://localhost:3000.

Start Local Python Server & AI:

Open a third new terminal/command prompt window.

Navigate to the ppython/ directory.

Run the Flask local server: python server.py

This server will now be listening for commands, and it will eventually launch the AI.

Access the Dashboard & Trigger AI:

Open your web browser and go to http://localhost:3000.

On the dashboard, you should find a button (e.g., "Launch Detection"). Click this button. This sends a command to your local Python Flask server, which then starts the countobjwithvoice.py script.

Observe:

You should see a new OpenCV window pop up on your local machine, showing the live camera feed with detections.

You should hear voice alerts when people enter/exit (if audio is enabled).

Your web dashboard in the browser (http://localhost:3000) should now show the live occupancy count updating in real-time and historical data being logged to your local MongoDB instance.

Challenges & Learnings

Real-time Cross-Language Communication

Managing Multiple Services Locally

Distributed System Debugging

Future Enhancements

Add alerts for maximum room occupancy.

Integrate more cameras for larger areas.

Provide deeper historical data insights like heatmaps.

Add secure logins for dashboard access.

Package components with Docker for easier setup and portability.

