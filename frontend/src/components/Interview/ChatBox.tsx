import { useState, useEffect, useRef } from 'react';
import { Send, X, Mic, MicOff } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

export function ChatBox({ onEnd }: { onEnd: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // State for persistent stream and recording status
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTranscribing]);

  // 2. Initialize WebSocket & Request Mic Permissions on Mount
  useEffect(() => {
    // WebSocket Setup
    const ws = new WebSocket('ws://localhost:8000/ws/interview');
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected. Waiting for AI greeting...");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'ai_turn') {
          setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
          if (data.audio) setCurrentAudio(data.audio);
        }
      } catch (e) {
        console.error("Error parsing WS message:", e);
      }
    };

    ws.onclose = () => setIsConnected(false);

    // Microphone Setup (Persistent)
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setMediaStream(stream);
        console.log("Microphone access granted.");
      })
      .catch(err => {
        console.error("Error accessing microphone:", err);
        alert("Microphone access is required for the interview.");
      });

    return () => {
      ws.close();
      // Don't stop the tracks here if you want them to persist across re-renders, 
      // but usually good practice to clean up on unmount.
      // We'll clean up purely to avoid leaks when leaving the component.
      mediaStream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 3. Toggle Recording Logic
  const toggleRecording = () => {
    if (!mediaStream) {
      alert("Microphone not found. Please check permissions.");
      return;
    }

    if (isRecording) {
      // STOP recording -> Process
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      // START recording
      const recorder = new MediaRecorder(mediaStream);
      audioChunksRef.current = []; // Reset chunks

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Only send if we actually have data
        if (audioBlob.size > 0) {
          await sendVoice(audioBlob);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  // 4. Send Voice to Backend
  const sendVoice = async (blob: Blob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', blob);

    try {
      // Use full URL to avoid port issues if proxy isn't set
      const res = await fetch('http://localhost:8000/transcribe', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error("Transcription failed");

      const data = await res.json();
      if (data.text) {
        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', text: data.text }]);
        // Send text to WS to trigger AI response
        socketRef.current?.send(JSON.stringify({ type: 'user_turn', text: data.text }));
      }
    } catch (error) {
      console.error("Error sending voice:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  // 5. Handle Text Input
  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: inputText }]);
    socketRef.current?.send(JSON.stringify({ type: 'user_turn', text: inputText }));
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-200 font-semibold text-sm">AI Interview Session</span>
        </div>
        <button onClick={onEnd} className="hover:bg-slate-700/50 p-2 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Audio Visualizer / Status */}
        <div className="w-1/3 border-r border-slate-800 p-4 bg-slate-950/20 flex flex-col items-center justify-center gap-4">
          <div className="scale-75 transform">
            <AudioPlayer base64Audio={currentAudio} />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {isRecording ? "Listening" : isTranscribing ? "Processing" : "Standby"}
            </p>
            {isRecording && (
              <div className="flex gap-1 justify-center h-3 items-end">
                <div className="w-1 bg-red-500 animate-[bounce_1s_infinite] h-2"></div>
                <div className="w-1 bg-red-500 animate-[bounce_1.2s_infinite] h-3"></div>
                <div className="w-1 bg-red-500 animate-[bounce_0.8s_infinite] h-2"></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat & Controls */}
        <div className="flex-1 flex flex-col min-w-0">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-3 rounded-2xl text-sm max-w-[90%] leading-relaxed ${m.role === 'ai'
                    ? 'bg-slate-800 text-slate-200 rounded-tl-none'
                    : 'bg-indigo-600 text-white rounded-tr-none'
                  }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTranscribing && (
              <div className="flex justify-end">
                <div className="text-xs text-slate-400 animate-pulse bg-slate-800/40 px-3 py-1 rounded-full flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  Transcribing...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-slate-800/30 border-t border-slate-800 flex items-center gap-3">
            {/* Mic Toggle Button */}
            <button
              onClick={toggleRecording}
              disabled={isTranscribing || !mediaStream}
              className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${!isRecording
                  ? 'bg-slate-800/80 text-red-500 hover:bg-slate-700/80 border border-slate-700' // Muted State (Red Icon)
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20' // Unmuted State (Normal/Active)
                } ${(!mediaStream || isTranscribing) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              title={isRecording ? "Mute Microphone" : "Unmute Microphone"}
            >
              {/* Logic: !isRecording = Muted = Red Slash. isRecording = Unmuted = Normal Mic */}
              {!isRecording ? <MicOff size={22} /> : <Mic size={22} />}
            </button>

            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={isRecording}
              className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all placeholder:text-slate-600 disabled:opacity-50"
              placeholder={isRecording ? "Listening..." : "Type a message..."}
            />

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isRecording}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors border border-slate-700/50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}