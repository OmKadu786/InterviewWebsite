import { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2, Mic, MicOff } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/interview');
    socketRef.current = ws;
    ws.onopen = () => setIsConnected(true);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ai_turn') {
        setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
        if (data.audio) setCurrentAudio(data.audio);
      }
    };
    return () => ws.close();
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        sendVoice(audioBlob);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    }
  };

  const sendVoice = async (blob: Blob) => {
    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('file', blob);
    try {
      const res = await fetch('http://localhost:8000/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'user', text: data.text }]);
        socketRef.current?.send(JSON.stringify({ type: 'user_turn', text: data.text }));
      }
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
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-slate-100 font-bold">AI Technical Interview</span>
        </div>
        <button onClick={onEnd} className="hover:bg-slate-700 p-2 rounded-lg"><X className="text-slate-400" /></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r border-slate-800 p-6 bg-slate-950/20 flex items-center justify-center">
          <AudioPlayer base64Audio={currentAudio} />
        </div>

        <div className="flex-1 flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`p-4 rounded-2xl text-sm ${m.role === 'ai' ? 'bg-slate-800 text-slate-200' : 'bg-indigo-600 text-white'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTranscribing && <div className="text-xs text-slate-500 animate-pulse text-right">Processing voice...</div>}
          </div>

          <div className="p-4 bg-slate-800/50 border-t border-slate-800 flex items-center space-x-2">
            <button onClick={toggleRecording} className={`p-3 rounded-xl ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-700 text-slate-300'}`}>
              {isRecording ? <MicOff /> : <Mic />}
            </button>
            <input 
              value={inputText} 
              onChange={e => setInputText(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 outline-none focus:border-indigo-500"
              placeholder="Type or use the mic..."
            />
            <button onClick={handleSend} className="p-3 bg-indigo-600 rounded-xl text-white"><Send /></button>
          </div>
        </div>
      </div>
    </div>
  );
}