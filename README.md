# Real-Time Smart Occupancy & People Counting System

## 1. Project Overview

This AI-powered full-stack system combines real-time Computer Vision with a local web dashboard to automate occupancy tracking. Using **YOLOv8** and **OpenCV**, it counts people entering and exiting a space, announces changes via **voice alerts (pyttsx3)**, and visualizes the live and historical data on a responsive **React.js** interface. Built with privacy in mind (no facial recognition), it addresses key operational challenges like safety compliance, space optimization, and analytics for physical spaces.

---

## 2. Problem Solved & Applications

This project addresses inefficiencies in manual counting by automating real-time space tracking. Key applications include:

- **Retail & Malls**: Track customer foot traffic and peak hours  
- **Event Venues**: Monitor attendee count and crowd density for safety  
- **Schools & Universities**: Count people in cafeterias, labs, or lecture halls for capacity  
- **Smart Cities**: Analyze general foot traffic patterns in public areas  
- **Offices & Co-working**: Monitor real-time room and area occupancy  
- **Libraries & Study Rooms**: Identify busiest times and manage study space capacity  
- **Fitness Centers**: Track gym and class occupancy for better member experience  
- **Public Transport**: Monitor platform crowding for safety and operational insights  

---

## 3. System Architecture

The system operates as a set of interconnected services running locally on a single machine for development and demonstration.

**Architecture Overview**:  
`Camera Input → YOLOv8 AI Module (Python) → Flask Bridge → Node.js API → MongoDB → React.js Frontend`



---

## 4. Technologies Used

- **AI**: Python, YOLOv8, OpenCV, pyttsx3, Flask  
- **Backend**: Node.js, Express.js, Socket.IO  
- **Database**: MongoDB  
- **Frontend**: React.js, Chart.js  

---

## 5. Setup & Installation

### Folder Structure

your-repo/
├── frontend/ # React.js frontend application
├── backend/ # Node.js + Express API
├── ppython/ # Python AI (YOLOv8 + Flask)

yaml
Copy
Edit

### Prerequisites

- Python 3.8+  
- Node.js 16+  
- Git  
- MongoDB Community Server  
- mongosh (MongoDB Shell)  
- Webcam (for detection)

---

### Clone the Repository

```bash
git clone https://github.com/Jyoit/PersonCount.git
cd your-repo-name
MongoDB Local Setup
Install MongoDB from the official site

Start MongoDB:

bash
Copy
Edit
mongod --dbpath /path/to/your/data/directory
MongoDB should now be running at mongodb://localhost:27017

Backend Setup
bash
Copy
Edit
cd backend
npm install
Create a .env file in the backend/ folder:

ini
Copy
Edit
MONGO_URI=mongodb://localhost:27017/occupancy_db
FRONTEND_URL=http://localhost:3000
PORT=5001
Frontend Setup
bash
Copy
Edit
cd ../frontend
npm install
Create a .env.local file in the frontend/ folder:

ini
Copy
Edit
NEXT_PUBLIC_API_URL=http://localhost:5001
Python AI & Flask Setup
bash
Copy
Edit
cd ../ppython
pip install -r requirements.txt
Update ppython/config.ini with:

ini
Copy
Edit
[API]
url = http://localhost:5001/api/log
6. Running the Project
To run the system locally:

1. Start MongoDB
Ensure MongoDB is running with mongod.

2. Start Backend
bash
Copy
Edit
cd backend
npm start
3. Start Frontend
bash
Copy
Edit
cd ../frontend
npm run dev
4. Start Python Server
bash
Copy
Edit
cd ../ppython
python server.py
5. Trigger Detection from UI
Open browser → http://localhost:3000

Click the “Launch Detection” button

This triggers countobjwithvoice.py through the local Flask bridge

6. Observe
OpenCV window shows live camera feed

Voice alerts activate on entry/exit

Dashboard updates occupancy count in real-time

MongoDB logs historical occupancy data

7. Challenges & Learnings
AI Accuracy & False Positives: Tuned YOLO confidence threshold

Real-time Cross-Language Communication: Python ↔ Flask ↔ Node.js ↔ React

Managing Multiple Services Locally: Coordination across frontend/backend/AI

Distributed Debugging: Tracking issues across multiple components

8. Future Enhancements
Cloud Deployment for online access

Capacity Alerts

Multi-Camera Support

Advanced Analytics with Heatmaps

Secure User Logins

Dockerization for unified setup