from flask import Flask
from flask_cors import CORS  # Import the CORS library
import subprocess

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

process = None  # Global variable to track the subprocess

@app.route('/start-detection', methods=['POST'])
def start_detection():
    global process
    if not process or process.poll() is not None:
        try:
            process = subprocess.Popen(["python", "countobjwithvoice.py"])
            return "Started YOLO attendance detection.", 200
        except Exception as e:
            return f"Error starting detection: {str(e)}", 500
    return "Detection is already running.", 200

@app.route('/stop-detection')
def stop_detection():
    global process
    if process and process.poll() is None:
        process.terminate()
        process = None
        return "Detection stopped.", 200
    return "No detection process was running.", 200

if __name__ == "__main__":
    app.run(port=5000,debug=True)
