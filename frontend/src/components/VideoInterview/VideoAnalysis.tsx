import React, { useState, useRef, useCallback } from 'react';
import { Activity, Smile, Brain, Hand, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { WS_ENDPOINTS } from '../../config/api';
import { AIAssistanceBadge } from '../AIAssistanceBadge';

interface VideoAnalysisProps {
    onReady?: () => void;
    isAISpeaking?: boolean;
    isUserSpeaking?: boolean;
    currentHint?: string | null;
}

export const VideoAnalysis: React.FC<VideoAnalysisProps> = ({
    onReady,
    isAISpeaking = false,
    isUserSpeaking = false,
    currentHint = null
}) => {
    const webcamRef = useRef<Webcam>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    // Smoothed metrics state with exponential moving average
    const [smoothedMetrics, setSmoothedMetrics] = useState({
        focus: 50,
        emotion: 50,
        confidence: 50,
        stress: 50,
    });


    // Smoothing factor (0.3 = 30% new value, 70% old value)
    const SMOOTHING_FACTOR = 0.3;

    // Apply exponential moving average for smoother transitions
    const smoothValue = (oldVal: number, newVal: number) =>
        Math.round(oldVal * (1 - SMOOTHING_FACTOR) + newVal * SMOOTHING_FACTOR);

    // Timer effect
    React.useEffect(() => {
        const timer = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    // Stop interview on 'Esc' key
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                window.location.reload();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // WebSocket connection and frame sending
    React.useEffect(() => {
        if (onReady) onReady();

        const ws = new WebSocket(WS_ENDPOINTS.video);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected for video analysis");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Apply smoothing to metrics for natural transitions
                setSmoothedMetrics(prev => ({
                    focus: smoothValue(prev.focus, data.focus || 0),
                    emotion: smoothValue(prev.emotion, data.emotion || 0),
                    confidence: smoothValue(prev.confidence, data.confidence || 0),
                    stress: smoothValue(prev.stress, data.stress || 0),
                }));
            } catch (e) {
                console.error("Metric Parse Error", e);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket closed");
            setIsConnected(false);
        };

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [onReady]);

    // Capture and send frames at interval
    const captureFrame = useCallback(() => {
        if (webcamRef.current && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                // Send base64 image to backend
                wsRef.current.send(imageSrc);
            }
        }
    }, []);

    // Send frames every 100ms (10 FPS) for analysis
    React.useEffect(() => {
        const frameInterval = setInterval(captureFrame, 100);
        return () => clearInterval(frameInterval);
    }, [captureFrame]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full min-h-0 gap-4">
            {/* Main Video Card */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-black/40 border border-border/30 shadow-2xl backdrop-blur-sm group">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "user"
                    }}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    mirrored={true}
                />

                {/* Left: LIVE indicator */}
                <div className="absolute top-4 left-4">
                    <div className={`backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-xs font-medium ${isConnected ? 'bg-black/60 text-emerald-400' : 'bg-red-900/60 text-red-400'}`}>
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'} opacity-75`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                        {isConnected ? 'LIVE' : 'CONNECTING'}
                    </div>
                </div>

                {/* Right: AI Badge + Timestamp */}
                <div className="absolute top-4 right-4 flex items-center gap-3">
                    <AIAssistanceBadge isConnected={isConnected} />
                    <div className="bg-emerald-600 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold text-white font-mono shadow-lg">
                        {formatTime(elapsed)}
                    </div>
                </div>

                {/* Dynamic Overlay Messages — centered, themed to match site */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isAISpeaking ? 'ai' : isUserSpeaking ? 'user' : 'hint'}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-20"
                    >
                        {isAISpeaking ? (
                            <div className="bg-[#020617]/85 backdrop-blur-xl rounded-2xl px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 border border-purple-500/25">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 animate-pulse shrink-0">
                                    <Activity size={18} />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white tracking-wider uppercase">AI Speaking</p>
                                    <p className="text-[11px] text-purple-300/80 truncate">Listening carefully — Prepare your response</p>
                                </div>
                            </div>
                        ) : isUserSpeaking ? (
                            <div className="bg-[#020617]/85 backdrop-blur-xl rounded-2xl px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 border border-emerald-500/25">
                                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 shrink-0">
                                    <Hand size={18} />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white tracking-wider uppercase">Analysing Response</p>
                                    <p className="text-[11px] text-emerald-300/80 truncate">Maintain steady eye contact & clear articulation</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#020617]/85 backdrop-blur-xl rounded-2xl px-5 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3 border border-cyan-500/25">
                                <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 shrink-0">
                                    <Sparkles size={18} />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white tracking-wider uppercase">
                                        {currentHint ? "💡 Suggestion Tip" : "✨ Your Turn"}
                                    </p>
                                    <p className="text-[11px] text-cyan-300/90 leading-snug font-medium truncate">
                                        {currentHint || "Turn on mic and speak confidently"}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Metrics Panel - Using smoothed values */}
            <div className="shrink-0 grid grid-cols-3 gap-3">
                <MetricCard
                    label="Emotion"
                    value={smoothedMetrics.emotion}
                    icon={<Smile size={14} />}
                    color="text-yellow-400"
                    barColor="bg-yellow-400"
                />
                <MetricCard
                    label="Focus"
                    value={smoothedMetrics.focus}
                    icon={<Activity size={14} />}
                    color="text-blue-400"
                    barColor="bg-blue-400"
                />
                <MetricCard
                    label="Confidence"
                    value={smoothedMetrics.confidence}
                    icon={<Brain size={14} />}
                    color="text-purple-400"
                    barColor="bg-purple-400"
                />
            </div>
        </div>
    );
};

interface MetricCardProps {
    label: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    barColor: string;
}

const MetricCard = ({ label, value, icon, color, barColor }: MetricCardProps) => (
    <div className="bg-card/50 border border-border/50 rounded-xl p-3 flex flex-col gap-2 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">{icon} {label}</span>
            <span className={color}>{value}%</span>
        </div>
        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`h-full ${barColor} rounded-full`}
            />
        </div>
    </div>
);
