import React, { useCallback, useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Activity, Smile, Brain } from 'lucide-react';

interface VideoAnalysisProps {
    onReady?: () => void;
}

interface AnalysisResult {
    focus: number;
    emotion: number;
    confidence: number;
    stress: number;
    hint: string;
    is_steady: boolean;
}

export const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ onReady }) => {
    const webcamRef = useRef<Webcam>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);
    const [analysis, setAnalysis] = useState<AnalysisResult>({
        focus: 0,
        emotion: 0,
        confidence: 0,
        stress: 0,
        hint: "Waiting for camera...",
        is_steady: false,
    });

    const connectWebSocket = useCallback(() => {
        socketRef.current = new WebSocket('ws://localhost:8000/ws/video');

        socketRef.current.onopen = () => {
            console.log('Video WebSocket connected');
            setIsCapturing(true);
            if (onReady) onReady();
        };

        socketRef.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setAnalysis(data);
            } catch (e) {
                console.error('Error parsing video analysis:', e);
            }
        };

        socketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            setIsCapturing(false);
        };

        socketRef.current.onclose = () => {
            console.log('Video WebSocket closed');
            setIsCapturing(false);
        };
    }, [onReady]);

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [connectWebSocket]);

    useEffect(() => {
        if (!isCapturing) return;

        const interval = setInterval(() => {
            if (webcamRef.current && socketRef.current?.readyState === WebSocket.OPEN) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    socketRef.current.send(imageSrc);
                }
            }
        }, 200); // 5 FPS

        return () => clearInterval(interval);
    }, [isCapturing]);

    return (
        <div className="flex flex-col gap-4 w-full h-full">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800 aspect-video">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    mirrored
                />

                {/* Overlay Stats */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <StatBadge icon={<Activity size={16} />} label="Focus" value={analysis.focus} color="bg-blue-500" />
                    <StatBadge icon={<Smile size={16} />} label="Emotion" value={analysis.emotion} color="bg-yellow-500" />
                    <StatBadge icon={<Brain size={16} />} label="Confidence" value={analysis.confidence} color="bg-purple-500" />
                    <StatBadge icon={<Activity size={16} />} label="Stress" value={analysis.stress} color="bg-red-500" />
                </div>

                {/* AI Coach Hint Removed as per user request */}
            </div>
        </div>
    );
};

const StatBadge = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) => (
    <div className="bg-black/50 backdrop-blur-md px-3 py-2 rounded-lg flex items-center gap-3 border border-white/5 min-w-[140px]">
        <div className={`p-1.5 rounded-md ${color} bg-opacity-20 text-white`}>
            {icon}
        </div>
        <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{label}</span>
                <span className="font-mono">{value}%</span>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-300 ease-out`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    </div>
);
