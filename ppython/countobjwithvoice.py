import cv2
import time
import pyttsx3
import pygame
from datetime import datetime
import threading
from collections import defaultdict
from ultralytics import YOLO
import queue
import requests
import logging
import configparser

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load configuration
config = configparser.ConfigParser()
config.read('config.ini')
CONFIDENCE_THRESHOLD = float(config.get('YOLO', 'confidence_threshold', fallback=0.5))
IOU_THRESHOLD = float(config.get('YOLO', 'iou_threshold', fallback=0.45))
LOG_INTERVAL = int(config.get('Logging', 'log_interval', fallback=5))
VOICE_COOLDOWN = float(config.get('Voice', 'cooldown', fallback=1.0))
FRAME_WIDTH = int(config.get('Camera', 'frame_width', fallback=640))
FRAME_HEIGHT = int(config.get('Camera', 'frame_height', fallback=480))
TARGET_FPS = int(config.get('Camera', 'target_fps', fallback=30))
API_URL = config.get('API', 'url', fallback='http://localhost:5000/api/log')

class VoiceAnnouncer:
    def __init__(self):
        pygame.mixer.init()
        pygame.mixer.set_num_channels(2)
        self.voice_queue = queue.Queue(maxsize=10)
        self.last_announce_time = 0
        self.engine = None
        self.lock = threading.Lock()
        self._initialize_engine()
        
    def _initialize_engine(self):
        with self.lock:
            try:
                self.engine = pyttsx3.init()
                self.engine.setProperty('rate', 160)
                logger.info("Voice engine initialized")
            except Exception as e:
                logger.error(f"Voice engine initialization failed: {e}")
                self.engine = None
    
    def add_announcement(self, text):
        try:
            self.voice_queue.put_nowait(text)
        except queue.Full:
            logger.warning("Voice queue full, dropping announcement")
        
    def run(self):
        while True:
            try:
                with self.lock:
                    if time.time() - self.last_announce_time > VOICE_COOLDOWN:
                        text = self.voice_queue.get_nowait()
                        self._speak(text)
                        self.last_announce_time = time.time()
            except queue.Empty:
                time.sleep(0.1)
                continue
            except Exception as e:
                logger.error(f"Voice error: {e}")
                time.sleep(1)
    
    def _speak(self, text):
        try:
            if self.engine:
                self.engine.say(text)
                self.engine.runAndWait()
            else:
                sound = pygame.mixer.Sound(buffer=bytes([0]*100))
                for channel in range(pygame.mixer.get_num_channels()):
                    if not pygame.mixer.Channel(channel).get_busy():
                        pygame.mixer.Channel(channel).play(sound)
                        break
                logger.warning("Using fallback beep")
        except Exception as e:
            logger.error(f"Speech synthesis failed: {e}")
            self._initialize_engine()

class AttendanceLogger:
    def __init__(self, api_url):
        self.api_url = api_url
        self.last_log_time = 0

    def log_attendance(self, student_count):
        try:
            if time.time() - self.last_log_time >= LOG_INTERVAL:
                timestamp = int(time.time() * 1000)
                data = {"count": student_count, "timestamp": timestamp}
                response = requests.post(self.api_url, json=data, timeout=5)
                if response.status_code == 200:
                    logger.info(f"Logged to API: {timestamp} - {student_count} students")
                    self.last_log_time = time.time()
                    return True
                else:
                    logger.error(f"Failed to log to API: {response.status_code}")
                    return False
        except Exception as e:
            logger.error(f"Failed to log to API: {e}")
            return False

class StudentTracker:
    def __init__(self, model_path):
        self.model = YOLO(model_path)
        self.current_counts = defaultdict(int)
        self.current_ids = set()
        self.previous_ids = set()
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
        
        # Detect entries and exits
        entries = self.current_ids - self.previous_ids
        exits = self.previous_ids - self.current_ids
        self.previous_ids = self.current_ids.copy()
        
        current_detections = set(self.current_counts.keys())
        new_detections = current_detections - self.last_detections
        self.last_detections = current_detections
        
        return results[0].plot(), new_detections, entries, exits

def real_time_detection():
    voice_announcer = VoiceAnnouncer()
    attendance_logger = AttendanceLogger(API_URL)
    student_tracker = StudentTracker("yolov8m.pt")
    
    voice_thread = threading.Thread(target=voice_announcer.run, daemon=True)
    voice_thread.start()
    
    voice_announcer.add_announcement("Student attendance system activated")

    try:
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            logger.error("Failed to open camera")
            return
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
        cap.set(cv2.CAP_PROP_FPS, TARGET_FPS)
    except Exception as e:
        logger.error(f"Camera initialization failed: {e}")
        return
    
    cv2.namedWindow("Real-Time Student Attendance System", cv2.WINDOW_NORMAL)
    current_student_count = 0
    frame_time = 1.0 / TARGET_FPS

    while cap.isOpened():
        start_time = time.time()
        ret, frame = cap.read()
        if not ret:
            logger.error("Failed to read frame")
            break
        
        try:
            annotated_frame, new_detections, entries, exits = student_tracker.process_frame(frame)
        except Exception as e:
            logger.error(f"Frame processing failed: {e}")
            continue

        # Update current count based on entries and exits
        if entries:
            current_student_count += len(entries)
            voice_announcer.add_announcement(f"{len(entries)} student{'s' if len(entries) > 1 else ''} entered")
            logger.info(f"Entry: {len(entries)} student(s), Current: {current_student_count}")
            attendance_logger.log_attendance(current_student_count)
        if exits:
            current_student_count = max(0, current_student_count - len(exits))
            voice_announcer.add_announcement(f"{len(exits)} student{'s' if len(exits) > 1 else ''} exited")
            logger.info(f"Exit: {len(exits)} student(s), Current: {current_student_count}")
            attendance_logger.log_attendance(current_student_count)

        # Display current count
        cv2.putText(annotated_frame, f"Current Students: {current_student_count}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
        
        cv2.imshow("Real-Time Student Attendance System", annotated_frame)

        elapsed = time.time() - start_time
        sleep_time = max(0, frame_time - elapsed)
        time.sleep(sleep_time)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    voice_announcer.add_announcement("Student attendance system stopped")
    cap.release()
    cv2.destroyAllWindows()
    logger.info(f"Final student count: {current_student_count}")
    logger.info("System shutdown complete")

if __name__ == "__main__":
    if not config.has_section('YOLO'):
        config['YOLO'] = {'confidence_threshold': '0.5', 'iou_threshold': '0.45'}
        config['Logging'] = {'log_interval': '5'}
        config['Voice'] = {'cooldown': '1.0'}
        config['Camera'] = {'frame_width': '640', 'frame_height': '480', 'target_fps': '30'}
        config['API'] = {'url': 'http://localhost:5000/api/log'}
        with open('config.ini', 'w') as f:
            config.write(f)
    real_time_detection()