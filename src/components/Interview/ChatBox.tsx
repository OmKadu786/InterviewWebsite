import { useState, useEffect, useRef } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

interface ChatBoxProps {
  onEnd: () => void;
}

export function ChatBox({ onEnd }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // 1. Establish WebSocket Connection
    const ws = new WebSocket('ws://localhost:8000/ws/interview');
    socketRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ai_turn') {
        // 2. Add AI text to chat
        setMessages((prev) => [...prev, { role: 'ai', text: data.text }]);
        
        // 3. Trigger AudioPlayer with Base64 data
        if (data.audio) {
          setCurrentAudio(data.audio);
        }
      }
    };

    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputText.trim() || !socketRef.current) return;

    // 4. Send user response to Python Backend
    const userMessage: Message = { role: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    
    socketRef.current.send(JSON.stringify({
      type: 'user_turn',
      text: inputText
    }));

    setInputText("");
    setCurrentAudio(null); // Clear previous audio state
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-5 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <h2 className="text-slate-100 font-bold tracking-tight">AI Technical Interview</h2>
        </div>
        <button onClick={onEnd} className="p-2 hover:bg-slate-700/50 rounded-xl transition-all">
          <X className="w-5 h-5 text-slate-400 hover:text-white" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Audio & Visualizer */}
        <div className="w-1/3 border-r border-slate-800/50 p-6 flex flex-col justify-center bg-slate-950/20">
          <AudioPlayer base64Audio={currentAudio} />
        </div>

        {/* Right Side: Chat Transcript */}
        <div className="flex-1 flex flex-col bg-slate-900/30">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isConnected && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p>Connecting to AI Interviewer...</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'ai' 
                  ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' 
                  : 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-500/20'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Field */}
          <div className="p-4 bg-slate-800/30 border-t border-slate-800/50">
            <div className="flex items-center space-x-2 bg-slate-950/50 rounded-2xl p-2 border border-slate-700/50 focus-within:border-indigo-500/50 transition-all">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-transparent border-none px-4 py-2 text-slate-200 placeholder-slate-500 outline-none" 
                placeholder="Reply to the interviewer..." 
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}