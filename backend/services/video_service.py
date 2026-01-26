import cv2
import numpy as np
import base64
import time
import os
import random

# --- Configuration ---
# Loading cascades directly from cv2 data
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
smile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_smile.xml')
profile_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')

class Stabilizer:
    def __init__(self):
        # LK Params for Optical Flow
        self.lk_params = dict(winSize=(15, 15), maxLevel=2,
                              criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03))
        self.feature_params = dict(maxCorners=50, qualityLevel=0.3, minDistance=7, blockSize=7)
        
        self.prev_gray = None
        self.p0 = None
        self.is_steady = False
        
        # Smoothing buffers (Hysteresis)
        self.ui_focus = 100.0
        self.ui_emotion = 50.0
        self.confidence_score = 80.0
        self.focus_score = 100.0
        self.emotion_score = 50.0
        
        # Internal high-precision float values
        self.internal_focus = 100.0
        self.internal_emotion = 50.0

    def check_stability(self, gray, face_roi):
        """
        Returns True if the face is physically steady (ignoring sensor noise).
        """
        if self.p0 is None:
            if face_roi:
                (x, y, w, h) = face_roi
                mask = np.zeros_like(gray)
                mask[y:y+h, x:x+w] = 255
                self.p0 = cv2.goodFeaturesToTrack(gray, mask=mask, **self.feature_params)
            self.prev_gray = gray.copy()
            return False

        if self.prev_gray is None: return False

        # Calculate Flow
        p1, st, err = cv2.calcOpticalFlowPyrLK(self.prev_gray, gray, self.p0, None, **self.lk_params)
        
        steady = False
        if p1 is not None and len(p1) > 5:
            # Calculate average movement magnitude
            good_new = p1[st==1]
            good_old = self.p0[st==1]
            
            dists = []
            for new, old in zip(good_new, good_old):
                dist = np.linalg.norm(new - old)
                dists.append(dist)
            
            avg_dist = np.mean(dists) if dists else 0
            
            # Threshold: If avg movement < 0.6 pixels, we are "Rock Steady"
            if avg_dist < 0.6:
                steady = True
            
            self.p0 = good_new.reshape(-1, 1, 2)
        else:
            self.p0 = None # Re-init next frame
            
        self.prev_gray = gray.copy()
        self.is_steady = steady
        return steady

    def smooth(self, current_val, target_val, alpha=0.05):
        """
        Adaptive smoothing.
        If steady, alpha is effectively 0 (Locked).
        If moving, use alpha.
        """
        if self.is_steady:
            # Ultra slow drift if steady, just to keep it alive
            return current_val * 0.99 + target_val * 0.01
        else:
            return current_val * (1.0 - alpha) + target_val * alpha

    def get_ui_value(self, internal_val, last_displayed):
        """
        Hysteresis: Only update UI if change is > 1% to stop flicker.
        """
        diff = abs(internal_val - last_displayed)
        if diff > 1.0: 
            return internal_val
        return last_displayed

def generate_hint(focus, emotion, confidence):
    hints = []
    if focus < 60: hints += ["Eye contact is key.", "Focus on the lens."]
    if emotion < 30: hints += ["Smile to show warmth.", "Relax your face."]
    if confidence < 50: hints += ["Steady your head.", "Breathe deeply."]
    if not hints: hints = ["Perfect engagement.", "You're doing great.", "Maintain this vibe."]
    return random.choice(hints)

# Helper to process a base64 image
def process_video_frame(base64_image, stabilizer: Stabilizer):
    try:
        # Decode base64 image
        if ',' in base64_image:
            base64_image = base64_image.split(',')[1]
        
        image_bytes = base64.b64decode(base64_image)
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            return None

        # Optimization: Resize for faster processing if needed, but 1280x720 is fine for modern servers
        # frame = cv2.resize(frame, (640, 360)) 

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # 1. Detection
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        profiles = profile_cascade.detectMultiScale(gray, 1.3, 5) if len(faces) == 0 else []
        
        target_focus = 0.0
        target_emo = 0.0
        face_roi = None
        
        if len(faces) > 0:
            (x, y, w, h) = faces[0]
            face_roi = (x, y, w, h)
            roi_gray = gray[y:y+h, x:x+w]
            
            # Eyes
            eyes = eye_cascade.detectMultiScale(roi_gray, 1.1, 5)
            if len(eyes) >= 2: target_focus = 98.0
            elif len(eyes) == 1: target_focus = 88.0
            else: target_focus = 65.0 # Blinking?
            
            # Smile
            smiles = smile_cascade.detectMultiScale(roi_gray, 1.7, 22)
            if len(smiles) > 0: target_emo = 95.0
            else: target_emo = 45.0 # Neutral baseline
            
        elif len(profiles) > 0:
            target_focus = 35.0 # Looking away
            target_emo = 25.0
            (x,y,w,h) = profiles[0]
            face_roi = (x,y,w,h)
        else:
            target_focus = 10.0
            target_emo = 10.0

        # 2. Stability Check (Optical Flow)
        stabilizer.check_stability(gray, face_roi)
        
        # 3. Smooth & Hysteresis
        stabilizer.internal_focus = stabilizer.smooth(stabilizer.internal_focus, target_focus, alpha=0.05)
        stabilizer.internal_emotion = stabilizer.smooth(stabilizer.internal_emotion, target_emo, alpha=0.08)
        
        # Update Displayed State (Hysteresis applied)
        stabilizer.focus_score = stabilizer.get_ui_value(stabilizer.internal_focus, stabilizer.focus_score)
        stabilizer.emotion_score = stabilizer.get_ui_value(stabilizer.internal_emotion, stabilizer.emotion_score)
        
        # Derived Metrics
        conf_target = (stabilizer.focus_score * 0.6) + (stabilizer.emotion_score * 0.4)
        if stabilizer.is_steady: conf_target += 5 # Bonus for stability
        stabilizer.confidence_score = stabilizer.get_ui_value(conf_target, stabilizer.confidence_score)
        
        # Stress (Inverted conf)
        stress = max(0, 100 - stabilizer.confidence_score)

        hint = generate_hint(stabilizer.focus_score, stabilizer.emotion_score, stabilizer.confidence_score)
        
        return {
            "focus": int(stabilizer.focus_score),
            "emotion": int(stabilizer.emotion_score),
            "confidence": int(stabilizer.confidence_score),
            "stress": int(stress),
            "hint": hint,
            "is_steady": stabilizer.is_steady
        }

    except Exception as e:
        print(f"Error processing frame: {e}")
        return None
