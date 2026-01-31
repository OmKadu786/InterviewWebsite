import React, { useState } from 'react';
import { Activity, Smile, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS, WS_ENDPOINTS } from '../../config/api';

interface VideoAnalysisProps {
    onReady?: () => void;
}

export const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ onReady }) => {
    const [streamUrl] = useState(API_ENDPOINTS.stream);
    const [elapsed, setElapsed] = useState(0);
    const [analysis, setAnalysis] = useState({
        focus: 0,
        emotion: 0,
        confidence: 0,
        stress: 0,
        hint: "Connecting to AI...",
    });

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

    React.useEffect(() => {
        if (onReady) onReady();
        
        const ws = new WebSocket(WS_ENDPOINTS.metrics);
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setAnalysis({
                    focus: data.focus,
                    emotion: data.emotion,
                    confidence: data.confidence,
                    stress: data.stress,
                    hint: data.hint
                });
            } catch (e) {
                console.error("Metric Parse Error", e);
            }
        };
        
        return () => {
            ws.close();
        };
    }, [onReady]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full gap-4">
             {/* Main Video Card */}
            <div className="relative flex-1 rounded-2xl overflow-hidden bg-black/40 border border-border/30 shadow-2xl backdrop-blur-sm group">
                <img 
                    src={streamUrl}
                    alt="Live AI Video Feed"
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    onError={() => console.log("Video stream connection lost - camera released")}
                />
                
                {/* Left: LIVE indicator */}
                <div className="absolute top-4 left-4">
                    <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-xs font-medium text-emerald-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        LIVE
                    </div>
                </div>
                
                {/* Right: Timestamp */}
                <div className="absolute top-4 right-4">
                    <div className="bg-emerald-600 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold text-white font-mono shadow-lg">
                        {formatTime(elapsed)}
                    </div>
                </div>

                {/* Floating Hint */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 max-w-sm">
                    <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-black/60 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center shadow-lg"
                    >
                        <p className="text-sm font-medium text-blue-100">
                            ✨ {analysis.hint}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Metrics Panel */}
            <div className="grid grid-cols-3 gap-3">
                 <MetricCard 
                    label="Emotion" 
                    value={analysis.emotion} 
                    icon={<Smile size={14} />} 
                    color="text-yellow-400" 
                    barColor="bg-yellow-400" 
                />
                 <MetricCard 
                    label="Focus" 
                    value={analysis.focus} 
                    icon={<Activity size={14} />} 
                    color="text-blue-400" 
                    barColor="bg-blue-400" 
                />
                 <MetricCard 
                    label="Confidence" 
                    value={analysis.confidence} 
                    icon={<Brain size={14} />} 
                    color="text-purple-400" 
                    barColor="bg-purple-400" 
                />
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, color, barColor }: any) => (
    <div className="bg-card/50 border border-border/50 rounded-xl p-3 flex flex-col gap-2 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">{icon} {label}</span>
            <span className={color}>{value}%</span>
        </div>
        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full ${barColor} rounded-full`}
            />
        </div>
    </div>
);
