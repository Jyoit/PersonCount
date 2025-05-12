
# import random
import cv2
import time
# import traceback
import pyttsx3
import pygame
# import gspread
# from google.oauth2.service_account import Credentials
from datetime import datetime
import threading
from collections import defaultdict
from ultralytics import YOLO
import queue
import requests

# Constants
CONFIDENCE_THRESHOLD = 0.5
IOU_THRESHOLD = 0.45
LOG_INTERVAL = 5  # seconds
VOICE_COOLDOWN = 1.0  # seconds
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
TARGET_FPS = 30

class VoiceAnnouncer:
    def __init__(self):
        pygame.mixer.init()
        pygame.mixer.set_num_channels(2)
        self.voice_queue = queue.Queue()
        self.last_announce_time = 0
        self.engine = None
        self._initialize_engine()
        
    def _initialize_engine(self):
        try:
            self.engine = pyttsx3.init()
            self.engine.setProperty('rate', 160)
        except Exception as e:
            print(f"Voice engine initialization failed: {e}")
            self.engine = None
    
    def add_announcement(self, text):
        self.voice_queue.put(text)
        
    def run(self):
        while True:
            try:
                if time.time() - self.last_announce_time > VOICE_COOLDOWN:
                    text = self.voice_queue.get_nowait()
                    self._speak(text)
                    self.last_announce_time = time.time()
            except queue.Empty:
                time.sleep(0.1)
                continue
            except Exception as e:
                print(f"Voice error: {e}")
                time.sleep(1)
    
    def _speak(self, text):
        try:
            if self.engine:
                self.engine.say(text)
                self.engine.runAndWait()
            else:
                # Fallback to simple beep
                sound = pygame.mixer.Sound(buffer=bytes([0]*100))
                for channel in range(pygame.mixer.get_num_channels()):
                    if not pygame.mixer.Channel(channel).get_busy():
                        pygame.mixer.Channel(channel).play(sound)
                        break
        except Exception as e:
            print(f"Speech synthesis failed: {e}")
            self._initialize_engine()  # Try to reinitialize engine

# class AttendanceLogger:
    # def __init__(self, credentials_file, sheet_name):
    #     self.scopes = [
    #         "https://www.googleapis.com/auth/spreadsheets",
    #         "https://www.googleapis.com/auth/drive"
    #     ]
    #     self.credentials_file = credentials_file
    #     self.sheet_name = sheet_name
    #     self.client = None
    #     self._initialize_client()
        
    # def _initialize_client(self):
    #     try:
    #         creds = Credentials.from_service_account_file(
    #             self.credentials_file,
    #             scopes=self.scopes
    #         )
    #         self.client = gspread.authorize(creds)
    #         return True
    #     except Exception as e:
    #         print(f"Google Sheets client initialization failed: {e}")
    #         return False
    
    # def log_attendance(self, student_count):
    #     if not self.client and not self._initialize_client():
    #         return False
    #     try:
    #         spreadsheet = self.client.open(self.sheet_name)
    #         sheet = spreadsheet.sheet1
    #         timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    #         sheet.append_row([timestamp, student_count])
    #         print(f"[SUCCESS] Logged to Google Sheet: {timestamp} - {student_count} students")
    #         return True
    #     except Exception as e:
    #         print(f"[ERROR] Failed to log to Google Sheet: {str(e)}")
    #         print(traceback.format_exc())
    #         self.client = None  # Force reinitialization next time
    #         return False

class AttendanceLogger:
    def __init__(self, api_url):
        self.api_url = api_url  # e.g., "http://localhost:5000/api/log"

    def log_attendance(self, student_count):
        try:
            timestamp = int(time.time() * 1000)  # Convert to milliseconds
            data = {"count": student_count, "timestamp": timestamp}
            response = requests.post(self.api_url, json=data)
            if response.status_code == 200:
                print(f"[SUCCESS] Logged to API: {timestamp} - {student_count} students")
                return True
            else:
                print(f"[ERROR] Failed to log to API: {response.status_code}")
                return False
        except Exception as e:
            print(f"[ERROR] Failed to log to API: {str(e)}")
            return False

class StudentTracker:
    def __init__(self, model_path):
        self.model = YOLO(model_path)
        self.current_counts = defaultdict(int)
        self.current_ids = set()
        self.unique_students = set()
        self.last_detections = set()
        
    def process_frame(self, frame):
        results = self.model.track(
            frame, 
            persist=True, 
            conf=CONFIDENCE_THRESHOLD, 
            iou=IOU_THRESHOLD, 
            verbose=False
        )
        
        self.current_counts.clear()
        self.current_ids.clear()
        
        for box in results[0].boxes:
            class_id = int(box.cls)
            class_name = self.model.names[class_id]
            if class_name == "person":
                self.current_counts[class_name] += 1
                if hasattr(box, 'id') and box.id is not None:
                    person_id = int(box.id)
                    self.current_ids.add(person_id)
                    self.unique_students.add(person_id)
        
        current_detections = set(self.current_counts.keys())
        new_detections = current_detections - self.last_detections
        self.last_detections = current_detections
        
        return results[0].plot(), new_detections

def real_time_detection():
    # Initialize components
    voice_announcer = VoiceAnnouncer()
    # attendance_logger = AttendanceLogger("studen-456608-e03a2e77c66b.json", "Student_Attendance")
    attendance_logger = AttendanceLogger("http://localhost:5000/api/log")
    student_tracker = StudentTracker("yolov8n.pt")
    
    # Start voice thread
    voice_thread = threading.Thread(target=voice_announcer.run, daemon=True)
    voice_thread.start()
    
    voice_announcer.add_announcement("Student attendance system activated")

    # Initialize video capture
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
    cap.set(cv2.CAP_PROP_FPS, TARGET_FPS)
    
    cv2.namedWindow("Real-Time Student Attendance System", cv2.WINDOW_NORMAL)

    last_logged_unique_count = 0

    while cap.isOpened():
        start_time = time.time()
        ret, frame = cap.read()
        if not ret:
            break
        
        # Process frame
        annotated_frame, new_detections = student_tracker.process_frame(frame)

        # Handle new detections
        if new_detections:
            if len(new_detections) == 1:
                announcement = f"New detection: {next(iter(new_detections))}"
            else:
                items = list(new_detections)
                announcement = "New detections: " + ", ".join(items[:-1]) + " and " + items[-1]
            voice_announcer.add_announcement(announcement.lower())

        # Display information
        cv2.putText(annotated_frame, f"Current Students: {len(student_tracker.current_ids)}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        cv2.putText(annotated_frame, f"Total Unique: {len(student_tracker.unique_students)}", (10, 90),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)

        cv2.imshow("Real-Time Student Attendance System", annotated_frame)

        # Log attendance only when a new unique student is detected
        if len(student_tracker.unique_students) > last_logged_unique_count:
            attendance_logger.log_attendance(len(student_tracker.unique_students))
            last_logged_unique_count = len(student_tracker.unique_students)

        # Exit on 'q' key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Cleanup
    cap.release()
    cv2.destroyAllWindows()
    voice_announcer.add_announcement("Student attendance system stopped")
    print(f"\nFinal unique student count: {len(student_tracker.unique_students)}")
    print("System shutdown complete")

if __name__ == "__main__":
    real_time_detection()
