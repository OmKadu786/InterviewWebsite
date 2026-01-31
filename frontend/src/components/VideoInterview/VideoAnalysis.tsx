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
        <div className="relative w-full h-full bg-black">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover opacity-90"
                mirrored
            />

            {/* Cinematic Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/20" />

            {/* HUD Stats Bar - Floating Pills */}
            <div className="absolute bottom-6 w-full px-8 flex justify-center items-center gap-4">
                <StatPill icon={<Activity size={14} />} label="Focus" value={analysis.focus} color="text-blue-400" track="bg-blue-400" />
                <StatPill icon={<Smile size={14} />} label="Emotion" value={analysis.emotion} color="text-yellow-400" track="bg-yellow-400" />
                <StatPill icon={<Brain size={14} />} label="Confidence" value={analysis.confidence} color="text-purple-400" track="bg-purple-400" />
                <StatPill icon={<Activity size={14} />} label="Stress" value={analysis.stress} color="text-red-400" track="bg-red-400" />
            </div>

            {/* Recording Indicator */}
            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-red-500/10 backdrop-blur-md rounded-full border border-red-500/20 shadow-lg shadow-red-500/10">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 tracking-widest uppercase">Live Analysis</span>
            </div>
        </div>
    );
};

const StatPill = ({ icon, label, value, color, track }: { icon: React.ReactNode, label: string, value: number, color: string, track: string }) => (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl hover:bg-black/60 transition-all duration-300 hover:scale-105 hover:border-white/20 group">
        <div className={`p-1.5 rounded-lg bg-white/5 ${color} group-hover:bg-white/10 transition-colors`}>
            {icon}
        </div>
        <div className="flex flex-col gap-1 min-w-[80px]">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                <span className="text-[10px] font-mono font-bold text-white tabular-nums">{value}%</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${track} shadow-[0_0_8px_currentColor] transition-all duration-700 ease-out`}
                    style={{ width: `${value}%`, color: 'inherit' }} // Use inherited color for shadow
                />
            </div>
        </div>
    </div>
);
