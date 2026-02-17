import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Layout, Activity, Target, MessageSquare, Award, 
  Eye, Zap, ShieldCheck, Download, ChevronLeft, Sparkles, AlertCircle, Volume2, BookOpen
} from 'lucide-react';

// --- GEMINI API CONFIGURATION ---
const apiKey = ""; // Environment provided
const MODEL_TEXT = "gemini-2.5-flash-preview-09-2025";
const MODEL_TTS = "gemini-2.5-flash-preview-tts";

// Helper for Exponential Backoff
const fetchWithRetry = async (url: string, options: any, retries = 5, backoff = 1000): Promise<any> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

// --- DYNAMIC DATA CONFIG ---
const QUESTIONS_ANSWERED = 4;

const sessionData = [
  { q: 'Q1', confidence: 65, logic: 70, focus: 88, fillers: 1 },
  { q: 'Q2', confidence: 72, logic: 85, focus: 92, fillers: 0 },
  { q: 'Q3', confidence: 58, logic: 60, focus: 80, fillers: 3 },
  { q: 'Q4', confidence: 80, logic: 90, focus: 95, fillers: 0 },
  { q: 'Q5', confidence: 0, logic: 0, focus: 0, fillers: 0 },
  { q: 'Q6', confidence: 0, logic: 0, focus: 0, fillers: 0 },
].slice(0, QUESTIONS_ANSWERED);

const fillerWords = [
  { word: "um", count: 8 },
  { word: "uh", count: 5 },
  { word: "like", count: 12 },
  { word: "you know", count: 4 },
  { word: "basically", count: 7 }
];

const radarData = [
  { subject: 'DSA', A: 85, fullMark: 100 },
  { subject: 'OS', A: 70, fullMark: 100 },
  { subject: 'DBMS', A: 90, fullMark: 100 },
  { subject: 'System Design', A: 65, fullMark: 100 },
  { subject: 'Soft Skills', A: 88, fullMark: 100 },
];

export function CandidateReport({ analyticsData, interviewId }: { analyticsData?: any; interviewId?: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBriefing, setIsBriefing] = useState(false);
  const [isRoadmapping, setIsRoadmapping] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [score, setScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const avgLogic = sessionData.reduce((acc, d) => acc + d.logic, 0) / QUESTIONS_ANSWERED;
    const avgFillers = fillerWords.reduce((acc, d) => acc + d.count, 0);
    const calculated = Math.round(avgLogic - (avgFillers * 0.5));
    setScore(calculated > 100 ? 100 : calculated < 0 ? 0 : calculated);
  }, []);

  // ✨ Gemini API: Intelligent Feedback Generation
  const generateLiveFeedback = async () => {
    setIsGenerating(true);
    const context = {
      overallScore: score,
      metrics: sessionData,
      fillers: fillerWords,
      skills: radarData
    };

    const systemPrompt = "You are a senior technical interviewer. Analyze these mock interview metrics and provide structured JSON feedback. Return only JSON with keys: 'strengths', 'gaps', 'advice'. Keep each summary under 200 characters.";
    const userPrompt = `Analyze this data: ${JSON.stringify(context)}`;

    try {
      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );
      const parsed = JSON.parse(result.candidates[0].content.parts[0].text);
      setFeedback(parsed);
    } catch (error) {
      console.error("Gemini Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ✨ Gemini API: Smart Study Roadmap
  const generateRoadmap = async () => {
    setIsRoadmapping(true);
    const lowSkills = radarData.filter(s => s.A < 75).map(s => s.subject);
    const userPrompt = `Generate a 7-day study plan to improve in: ${lowSkills.join(", ")}. Be specific about topics. Output as JSON with keys 'day1' through 'day7'.`;

    try {
      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TEXT}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );
      const parsed = JSON.parse(result.candidates[0].content.parts[0].text);
      setRoadmap(parsed);
    } catch (error) {
      console.error("Roadmap Error:", error);
    } finally {
      setIsRoadmapping(false);
    }
  };

  // ✨ Gemini API: AI Audio Briefing (TTS)
  const playAudioBriefing = async () => {
    if (!feedback) return;
    setIsBriefing(true);
    
    const textToSay = `Say encouragingly: Great job today! Your ${feedback.strengths}. However, note that ${feedback.gaps}. My main advice is to ${feedback.advice}. You're getting there!`;

    try {
      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_TTS}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          body: JSON.stringify({
            contents: [{ parts: [{ text: textToSay }] }],
            generationConfig: { 
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } 
            }
          })
        }
      );

      const audioData = result.candidates[0].content.parts[0].inlineData.data;
      const audioBlob = pcmToWav(audioData, 24000); // 24kHz is standard for this model
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setIsBriefing(false);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsBriefing(false);
    }
  };

  // Utility to convert PCM to WAV for playback
  const pcmToWav = (base64Pcm: string, sampleRate: number) => {
    const pcmData = Uint8Array.from(atob(base64Pcm), c => c.charCodeAt(0));
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    view.setUint32(0, 0x46464952, true); view.setUint32(4, 36 + pcmData.length, true); view.setUint32(8, 0x45564157, true);
    view.setUint32(12, 0x20746d66, true); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    view.setUint32(36, 0x61746164, true); view.setUint32(40, pcmData.length, true);
    return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8 relative overflow-hidden">
      <audio ref={audioRef} className="hidden" />
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <button className="flex items-center text-emerald-500 text-xs font-bold uppercase tracking-widest mb-2 hover:text-emerald-400 transition-colors">
            <ChevronLeft size={16} /> Back to Session
          </button>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            Performance <span className="text-emerald-500">Analytics</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">✨ Powered by Gemini 2.5 Intelligence</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={playAudioBriefing}
            disabled={!feedback || isBriefing}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${!feedback ? 'bg-slate-800 text-slate-600 opacity-50' : 'bg-slate-900 border border-slate-700 text-white hover:bg-slate-800'}`}
          >
            <Volume2 size={18} className={isBriefing ? 'animate-pulse text-emerald-500' : ''} />
            {isBriefing ? 'Listening...' : '✨ Audio Brief'}
          </button>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* BENTO: Overall Score */}
        <div className="md:col-span-4 bg-[#0a0f1e]/80 border border-slate-800 rounded-[32px] p-8 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] group-hover:bg-emerald-500/10 transition-all"></div>
            <div className="relative z-10 text-center">
                <div className="relative inline-flex items-center justify-center mb-6">
                    <svg className="w-44 h-44 transform -rotate-90">
                        <circle cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-800" />
                        <circle cx="88" cy="88" r="78" stroke="currentColor" strokeWidth="10" fill="transparent" 
                            strokeDasharray={490} strokeDashoffset={490 - (490 * score) / 100}
                            className="text-emerald-500 transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-6xl font-black text-white tracking-tighter">{score}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Readiness</span>
                    </div>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                  Performance Accurate
                </div>
            </div>
        </div>

        {/* BENTO: Score Breakdown */}
        <div className="md:col-span-4 bg-[#0a0f1e]/80 border border-slate-800 rounded-[32px] p-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
              <Zap size={14} className="text-yellow-500" /> Competency Breakdown
            </h3>
            <div className="space-y-6">
                {[
                    { label: 'Technical Accuracy', val: 85, color: '#10b981' },
                    { label: 'Reasoning Density', val: 74, color: '#facc15' },
                    { label: 'Problem Solving', val: 92, color: '#10b981' },
                    { label: 'Self-Correction', val: 68, color: '#facc15' },
                ].map((item, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                            <span className="text-slate-300">{item.label}</span>
                            <span className="text-white">{item.val}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: item.color }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* BENTO: Quick Stats & Filler Words */}
        <div className="md:col-span-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0f1e]/80 border border-slate-800 rounded-[24px] p-5 flex flex-col items-center justify-center text-center">
                    <Eye className="text-emerald-500 mb-2" size={24} />
                    <span className="text-2xl font-black text-white">94%</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Eye Contact</span>
                </div>
                <div className="bg-[#0a0f1e]/80 border border-slate-800 rounded-[24px] p-5 flex flex-col items-center justify-center text-center">
                    <Award className="text-yellow-500 mb-2" size={24} />
                    <span className="text-2xl font-black text-white">Gold</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Confidence</span>
                </div>
            </div>
            
            <div className="bg-[#0a0f1e]/80 border border-slate-800 rounded-[24px] p-6 flex-1">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Most Used Filler Words</h4>
                <div className="flex flex-wrap gap-2">
                    {fillerWords.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                            <span className="text-xs font-bold text-white">"{f.word}"</span>
                            <span className="text-[10px] bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded font-black">{f.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* MIDDLE ROW: Radar & Dynamic Bar Chart */}
        <div className="md:col-span-6 bg-[#0a0f1e]/80 border border-slate-800 rounded-[32px] p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <Target size={16} className="text-emerald-500" /> Skill Geometry
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <Radar
                  name="Proficiency"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="md:col-span-6 bg-[#0a0f1e]/80 border border-slate-800 rounded-[32px] p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={16} className="text-emerald-500" /> Dynamic Reasoning Density
            </h3>
            <span className="text-[10px] font-bold text-slate-500">Q1 - Q{QUESTIONS_ANSWERED}</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="q" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(16, 185, 129, 0.05)'}}
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '16px' }}
                />
                <Bar dataKey="logic" radius={[8, 8, 0, 0]} barSize={40}>
                  {sessionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#facc15'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BOTTOM ROW: AI Feedback Generation */}
        <div className="md:col-span-12 bg-[#0a0f1e]/80 border border-slate-800 rounded-[32px] p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={120} className="text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Sparkles size={24} className="text-emerald-500" /> ✨ AI Live Feedback
                </h3>
                <p className="text-sm text-slate-500 font-medium">Real-time deep reasoning analysis powered by Gemini 2.5 Flash.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                    onClick={generateLiveFeedback}
                    disabled={isGenerating}
                    className="flex-1 md:flex-none bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isGenerating ? "Reasoning..." : "✨ Generate Logic"}
                </button>
                <button 
                    onClick={generateRoadmap}
                    disabled={isRoadmapping}
                    className="flex-1 md:flex-none bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <BookOpen size={16} />
                    {isRoadmapping ? "Mapping..." : "✨ Get Roadmap"}
                </button>
              </div>
            </div>

            {/* Content Display */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Feedback Panel */}
                <div className="md:col-span-8">
                    {!feedback && !isGenerating && (
                        <div className="border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center bg-slate-950/50">
                            <MessageSquare className="mx-auto text-slate-700 mb-4" size={48} />
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Click Generate Logic to synthesize performance metrics</p>
                        </div>
                    )}

                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center p-12 gap-4 bg-[#020617] border border-slate-800 rounded-3xl">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-emerald-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Running Multi-Agent Orchestration...</p>
                        </div>
                    )}

                    {feedback && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-2xl">
                                <h4 className="text-emerald-400 font-black text-[10px] uppercase mb-3 flex items-center gap-2 tracking-widest">
                                    <Award size={14} /> Core Strengths
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{feedback.strengths}</p>
                            </div>
                            <div className="bg-yellow-500/5 border border-yellow-500/20 p-6 rounded-2xl">
                                <h4 className="text-yellow-400 font-black text-[10px] uppercase mb-3 flex items-center gap-2 tracking-widest">
                                    <AlertCircle size={14} /> Critical Gaps
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{feedback.gaps}</p>
                            </div>
                            <div className="bg-slate-800/20 border border-slate-700 p-6 rounded-2xl">
                                <h4 className="text-slate-400 font-black text-[10px] uppercase mb-3 flex items-center gap-2 tracking-widest">
                                    <Target size={14} /> Pro Advice
                                </h4>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">{feedback.advice}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Roadmap Panel */}
                <div className="md:col-span-4 h-full">
                    <div className="bg-[#0f172a]/50 border border-slate-800 rounded-3xl p-6 h-full min-h-[200px]">
                        <h4 className="text-white font-black text-xs uppercase mb-4 flex items-center gap-2 tracking-widest">
                            ✨ 7-Day Mastery Plan
                        </h4>
                        {!roadmap && !isRoadmapping && (
                            <div className="flex flex-col items-center justify-center h-48 opacity-40">
                                <BookOpen size={32} className="mb-2" />
                                <p className="text-[10px] font-bold">Generate a study path</p>
                            </div>
                        )}
                        {isRoadmapping && (
                            <div className="animate-pulse space-y-3">
                                {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-800 rounded w-full"></div>)}
                            </div>
                        )}
                        {roadmap && (
                            <div className="text-xs space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {Object.entries(roadmap).map(([day, task], i) => (
                                    <div key={i} className="border-b border-slate-800 pb-2">
                                        <span className="text-emerald-500 font-black uppercase text-[9px] block mb-1">{day}</span>
                                        <p className="text-slate-300 leading-snug">{task as string}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>
        </div>

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};
