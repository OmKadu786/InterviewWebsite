import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioPlayer } from './AudioPlayer';
import { API_ENDPOINTS, WS_ENDPOINTS } from '../../config/api';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface ChatBoxProps {
  onEnd: () => void;
  onAISpeakingChange?: (speaking: boolean) => void;
  onUserSpeakingChange?: (speaking: boolean) => void;
}

export function ChatBox({ onEnd, onAISpeakingChange, onUserSpeakingChange }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTranscribing]);

  useEffect(() => {
    const ws = new WebSocket(WS_ENDPOINTS.interview);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected.");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ai_turn') {
          setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
          if (data.audio) {
            setCurrentAudio(data.audio);
            // Notify parent that AI is speaking
            onAISpeakingChange?.(true);
            // Auto-clear after estimated speaking time (3s per 50 chars)
            const speakDuration = Math.max(3000, (data.text.length / 50) * 3000);
            setTimeout(() => onAISpeakingChange?.(false), speakDuration);
          }
        }
      } catch (e) {
        console.error("Error parsing WS message:", e);
      }
    };

    ws.onclose = () => setIsConnected(false);

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => setMediaStream(stream))
      .catch(err => console.error("Error accessing microphone:", err));

    return () => {
      ws.close();
      mediaStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const toggleRecording = () => {
    if (!mediaStream) {
      alert("Microphone not found.");
      return;
    }

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      onUserSpeakingChange?.(false);
    } else {
      const recorder = new MediaRecorder(mediaStream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size > 0) await sendVoice(audioBlob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      onUserSpeakingChange?.(true);
    }
  };

  const sendVoice = async (blob: Blob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', blob);

    try {
      const res = await fetch(API_ENDPOINTS.transcribe, {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error("Transcription failed");
      const data = await res.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'user', text: data.text }]);
        socketRef.current?.send(JSON.stringify({ type: 'user_turn', text: data.text }));
      }
    } catch (error) {
      console.error("Error sending voice:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputText }]);
    socketRef.current?.send(JSON.stringify({ type: 'user_turn', text: inputText }));
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-card/30 backdrop-blur-md rounded-2xl border border-border/50 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-border/50 flex justify-between items-center bg-card/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="font-semibold text-sm">Live Transcript</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 bg-secondary/50 rounded-full">
          <span className="text-xs text-muted-foreground">LLM:</span>
          <span className="text-xs font-medium text-hirebyte-mint">GPT-4o mini</span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth chat-scroll">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full opacity-30 text-center text-sm">
                AI conversation will appear here...
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    x: m.role === 'ai' ? -40 : 40,
                    y: 10,
                    scale: 0.95,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 24,
                    delay: 0.05,
                  }}
                  className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`p-3 rounded-2xl text-sm max-w-[90%] leading-relaxed ${m.role === 'ai'
                    ? 'bg-secondary text-secondary-foreground rounded-tl-none'
                    : 'bg-primary text-primary-foreground rounded-tr-none shadow-md'
                    }`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTranscribing && (
              <div className="flex justify-end">
                <div className="text-xs text-muted-foreground animate-pulse bg-secondary/50 px-3 py-1 rounded-full flex items-center gap-2">
                  Transcribing...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="shrink-0 p-3 bg-card/40 border-t border-border/50 flex items-center gap-3 backdrop-blur-md">
            <button
              onClick={toggleRecording}
              disabled={isTranscribing || !mediaStream}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${!isRecording
                ? 'bg-secondary hover:bg-secondary/80 text-destructive'
                : 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                } ${(!mediaStream || isTranscribing) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {!isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={isRecording}
              className="flex-1 bg-background/50 border border-input rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground disabled:opacity-50"
              placeholder={isRecording ? "Listening..." : "Type a message..."}
            />

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isRecording}
              className="p-2.5 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition-colors shadow-md shadow-primary/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Audio Player for playback */}
      <div className="hidden">
        <AudioPlayer base64Audio={currentAudio} />
      </div>
    </div>
  );
}