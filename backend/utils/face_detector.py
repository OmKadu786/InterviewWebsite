"""
Enhanced Face Detector for HireByte
Provides real-time face detection with extended metrics for interview analytics.
"""
import cv2
import numpy as np
from typing import Dict, List, Optional
import time


class FaceDetector:
    """
    Enhanced face detector with comprehensive behavioral metrics tracking.
    Tracks eye contact, emotion, steadiness, and provides timeline data for analytics.
    """
    
    def __init__(self):
        self.camera = None
        self.is_running = False
        
        # Load cascades
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_eye.xml'
        )
        self.smile_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_smile.xml'
        )
        
        # Current metrics (real-time)
        self.latest_metrics = {
            "focus": 85,
            "emotion": 60,
            "confidence": 75,
            "stress": 20,
            "hint": "Ready...",
            "is_steady": True,
            "eye_contact": True,
            "face_visible": True,
            "attentiveness": 80
        }
        
        # Historical tracking for analytics
        self.metrics_history: List[Dict] = []
        self.session_start_time: Optional[float] = None
        self.current_question_index = 0
        self.question_metrics: List[Dict] = []  # Per-question aggregated metrics
        
        # Frame counters for percentages
        self.total_frames = 0
        self.eye_contact_frames = 0
        self.face_visible_frames = 0
        self.steady_frames = 0
        
        # Optical flow tracking
        self.prev_gray = None
        self.p0 = None
        self.tracker_params = dict(
            winSize=(15, 15), 
            maxLevel=2,
            criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03)
        )
        
        # Movement history for smoothing
        self.movement_history: List[float] = []
        self.MOVEMENT_WINDOW = 10

    def open_camera(self):
        """Open the camera and start the session."""
        if self.camera is None or not self.camera.isOpened():
            self.camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
            if not self.camera.isOpened():
                self.camera = cv2.VideoCapture(0)
            self.camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            self.is_running = True
            self.session_start_time = time.time()
            print("Camera opened - HireByte Vision Active")

    def close_camera(self):
        """Close camera and finalize session metrics."""
        if self.camera and self.camera.isOpened():
            self.camera.release()
            self.camera = None
            self.is_running = False
            print("Camera closed - Session ended")

    def start_new_question(self):
        """
        Mark the start of a new question for per-question analytics.
        Call this when AI asks a new question.
        """
        # Save previous question's aggregated metrics
        if self.total_frames > 0:
            self._save_question_metrics()
        
        # Reset counters for new question
        self.current_question_index += 1
        self.total_frames = 0
        self.eye_contact_frames = 0
        self.face_visible_frames = 0
        self.steady_frames = 0

    def _save_question_metrics(self):
        """Aggregate and save metrics for the completed question."""
        if self.total_frames == 0:
            return
            
        metrics = {
            "question_index": self.current_question_index,
            "eye_contact_percentage": round(
                (self.eye_contact_frames / self.total_frames) * 100, 1
            ),
            "face_visibility_percentage": round(
                (self.face_visible_frames / self.total_frames) * 100, 1
            ),
            "steadiness_percentage": round(
                (self.steady_frames / self.total_frames) * 100, 1
            ),
            "avg_focus": self.latest_metrics["focus"],
            "avg_emotion": self.latest_metrics["emotion"],
            "avg_confidence": self.latest_metrics["confidence"],
            "timestamp": time.time() - (self.session_start_time or time.time())
        }
        self.question_metrics.append(metrics)

    def get_frame(self) -> Optional[bytes]:
        """
        Capture and analyze a single frame.
        Returns JPEG bytes or None.
        """
        if not self.camera or not self.camera.isOpened():
            return None
            
        success, frame = self.camera.read()
        if not success:
            return None
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        self.total_frames += 1
        focus_score = 50
        emotion_score = 50
        steady = True
        eye_contact = False
        face_visible = False
        
        frame_height, frame_width = frame.shape[:2]
        frame_center_x = frame_width // 2
        
        if len(faces) > 0:
            face_visible = True
            self.face_visible_frames += 1
            (x, y, w, h) = faces[0]
            roi_gray = gray[y:y+h, x:x+w]
            
            # Face detection (no visual overlay - clean video feed)
            
            # Eye detection for focus/eye contact
            eyes = self.eye_cascade.detectMultiScale(roi_gray, 1.1, 5)
            if len(eyes) >= 2:
                focus_score = 95
                eye_contact = True
                self.eye_contact_frames += 1
            elif len(eyes) == 1:
                focus_score = 80
            else:
                focus_score = 60
            
            # Check if face is centered (for attentiveness)
            face_center_x = x + w // 2
            offset_ratio = abs(face_center_x - frame_center_x) / frame_center_x
            attentiveness = max(0, 100 - (offset_ratio * 100))
            
            # Smile/emotion detection
            smiles = self.smile_cascade.detectMultiScale(roi_gray, 1.7, 20)
            if len(smiles) > 0:
                emotion_score = 90
            else:
                emotion_score = 50
            
            # Stability via optical flow
            if self.prev_gray is not None and self.p0 is not None:
                try:
                    p1, st, err = cv2.calcOpticalFlowPyrLK(
                        self.prev_gray, gray, self.p0, None, **self.tracker_params
                    )
                    if p1 is not None and len(st) > 0:
                        good_new = p1[st == 1]
                        good_old = self.p0[st == 1]
                        if len(good_new) > 0:
                            movement = np.mean(np.linalg.norm(good_new - good_old, axis=1))
                            self.movement_history.append(movement)
                            if len(self.movement_history) > self.MOVEMENT_WINDOW:
                                self.movement_history.pop(0)
                            avg_movement = np.mean(self.movement_history)
                            if avg_movement > 0.8:
                                steady = False
                            if len(good_new) > 0:
                                self.p0 = good_new.reshape(-1, 1, 2)
                except Exception:
                    pass
            else:
                mask = np.zeros_like(gray)
                mask[y:y+h, x:x+w] = 255
                self.p0 = cv2.goodFeaturesToTrack(
                    gray, mask=mask, maxCorners=50, 
                    qualityLevel=0.3, minDistance=7, blockSize=7
                )
            
            self.prev_gray = gray.copy()
            
            if steady:
                self.steady_frames += 1
            
            # Smooth metric transitions
            old_focus = self.latest_metrics["focus"]
            old_emo = self.latest_metrics["emotion"]
            old_att = self.latest_metrics.get("attentiveness", 80)
            
            new_focus = int(old_focus * 0.8 + focus_score * 0.2)
            new_emo = int(old_emo * 0.9 + emotion_score * 0.1)
            new_att = int(old_att * 0.85 + attentiveness * 0.15)
            
            # Confidence composite score
            conf = (new_focus * 0.4) + (new_emo * 0.25) + (new_att * 0.15) + (20 if steady else 0)
            conf = min(100, max(0, int(conf)))
            
            # Generate contextual hints
            if new_focus < 70:
                hint = "Maintain eye contact with the camera."
            elif not steady:
                hint = "Try to keep your head steady."
            elif new_att < 60:
                hint = "Center yourself in the frame."
            elif new_emo < 50:
                hint = "A slight smile can help convey confidence!"
            else:
                hint = "Great composure! Keep it up."
            
            self.latest_metrics = {
                "focus": new_focus,
                "emotion": new_emo,
                "confidence": conf,
                "stress": 100 - conf,
                "hint": hint,
                "is_steady": steady,
                "eye_contact": eye_contact,
                "face_visible": True,
                "attentiveness": new_att
            }
        else:
            # No face detected
            self.latest_metrics["focus"] = max(0, self.latest_metrics["focus"] - 5)
            self.latest_metrics["face_visible"] = False
            self.latest_metrics["eye_contact"] = False
            self.latest_metrics["hint"] = "Please align your face with the camera."
            self.p0 = None
        
        # Record to history (sampled every ~10 frames to avoid memory bloat)
        if self.total_frames % 10 == 0:
            self.metrics_history.append({
                "timestamp": time.time() - (self.session_start_time or time.time()),
                **self.latest_metrics
            })
        
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            return None
        return buffer.tobytes()

    def generate_frames(self):
        """Generator for streaming MJPEG frames."""
        self.open_camera()
        try:
            while self.is_running:
                frame_bytes = self.get_frame()
                if frame_bytes:
                    yield (
                        b'--frame\r\n'
                        b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n'
                    )
        except GeneratorExit:
            print("Client disconnected, releasing camera")
        finally:
            self._save_question_metrics()  # Save final question
            self.close_camera()

    def get_session_analytics(self) -> Dict:
        """
        Get comprehensive analytics for the entire interview session.
        Call this after the interview ends.
        """
        total = self.total_frames if self.total_frames > 0 else 1
        
        return {
            "session_duration_seconds": (
                time.time() - self.session_start_time 
                if self.session_start_time else 0
            ),
            "total_frames_analyzed": self.total_frames,
            "overall_eye_contact_percentage": round(
                (self.eye_contact_frames / total) * 100, 1
            ),
            "overall_face_visibility_percentage": round(
                (self.face_visible_frames / total) * 100, 1
            ),
            "overall_steadiness_percentage": round(
                (self.steady_frames / total) * 100, 1
            ),
            "per_question_metrics": self.question_metrics,
            "metrics_timeline": self.metrics_history[-100:],  # Last 100 samples
            "final_metrics": self.latest_metrics
        }

    def reset_session(self):
        """Reset all tracking for a new interview session."""
        self.metrics_history = []
        self.question_metrics = []
        self.session_start_time = None
        self.current_question_index = 0
        self.total_frames = 0
        self.eye_contact_frames = 0
        self.face_visible_frames = 0
        self.steady_frames = 0
        self.movement_history = []
        self.prev_gray = None
        self.p0 = None
        self.latest_metrics = {
            "focus": 85,
            "emotion": 60,
            "confidence": 75,
            "stress": 20,
            "hint": "Ready...",
            "is_steady": True,
            "eye_contact": True,
            "face_visible": True,
            "attentiveness": 80
        }
