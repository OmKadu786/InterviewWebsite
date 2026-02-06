import { useState, useEffect, useRef } from 'react';
import { Send, X, Mic, MicOff, Loader2, Sparkles } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';
import { WS_BASE_URL, API_BASE_URL } from '../../config';


interface Message {
  role: 'ai' | 'user';
  text: string;
}

// Update interface
export function ChatBox({ onEnd, onAiMessage }: { onEnd: (messages: Message[]) => void, onAiMessage: (text: string) => void }) {
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
    const ws = new WebSocket(`${WS_BASE_URL}/ws/interview`);
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
          // Notify parent (App.tsx) about the new question
          if (onAiMessage && data.text) onAiMessage(data.text);
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
      const res = await fetch(`${API_BASE_URL}/transcribe`, {

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
    <div className="flex flex-col h-full w-full bg-[#050505]/50 backdrop-blur-3xl">
      {/* Header - Cleaner & Integrated Audio Visualizer */}
      <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
            {isConnected && <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-50" />}
          </div>
          <div className="flex flex-col">
            <span className="text-gray-100 font-medium text-sm tracking-wide">AI Interviewer</span>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{isRecording ? "Listening..." : "Active"}</span>
          </div>
        </div>

        {/* Integrated Waveform Animation */}
        <div className="flex-1 flex justify-center mx-4">
          <AudioPlayer base64Audio={currentAudio} />
        </div>

        <button
          onClick={() => onEnd(messages)}
          className="hover:bg-red-500/10 p-2 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
          title="End Interview"
        >
          <X size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-3 opacity-50">
              <Sparkles size={24} />
              <p className="text-sm">Say "Hello" to start</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'} group`}>
              <div
                className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-sm transition-all duration-200 ${m.role === 'ai'
                  ? 'bg-[#18181b] border border-white/5 text-gray-200 rounded-2xl rounded-tl-sm hover:border-white/10'
                  : 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-indigo-500/10'
                  }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTranscribing && (
            <div className="flex justify-end">
              <div className="text-[10px] text-gray-400 animate-pulse bg-white/5 px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Transcribing...
              </div>
            </div>
          )}
        </div>

        {/* Input Area - Floating aesthetic */}
        <div className="p-4 pt-2">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl shadow-black/50">
            {/* Mic Toggle Button */}
            <button
              onClick={toggleRecording}
              disabled={isTranscribing || !mediaStream}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${!isRecording
                ? 'hover:bg-white/5 text-gray-400 hover:text-white'
                : 'bg-red-500/10 text-red-500 animate-pulse'
                } ${(!mediaStream || isTranscribing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {!isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <div className="flex-1">
              <input
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                disabled={isRecording}
                className="w-full bg-transparent border-none text-sm text-gray-200 outline-none placeholder:text-gray-600 h-10 px-2"
                placeholder={isRecording ? "Listening..." : "Type a message..."}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isRecording}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all hover:scale-105 active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}