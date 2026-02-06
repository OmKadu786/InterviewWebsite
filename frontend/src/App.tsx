import { useState } from 'react';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ChatBox } from './components/Interview/ChatBox';
import { VideoAnalysis } from './components/VideoInterview/VideoAnalysis';
import { Footer } from './components/Layout/Footer';
import { Hero } from './components/Home/Hero';
import { Report } from './components/Report/Report'; // Will create this next
import { API_BASE_URL } from './config';


function App() {
  const [view, setView] = useState<'landing' | 'setup' | 'interview' | 'report'>('landing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJobDescExpanded, setIsJobDescExpanded] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [hint, setHint] = useState<string | null>(null);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: string, text: string }[]>([]);

  // Validate form
  const isFormValid = selectedFile !== null && jobDescription.trim().length > 0;

  const handleAiMessage = (text: string) => {
    setCurrentQuestion(text);
    setHint(null); // Reset hint for new question
  };

  const handleGetHint = async () => {
    if (!currentQuestion) return;
    setIsGettingHint(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get-hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion }),
      });
      const data = await response.json();
      if (data.hint) setHint(data.hint);
    } catch (error) {
      console.error("Error getting hint:", error);
    } finally {
      setIsGettingHint(false);
    }
  };

  const handleStartInterview = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile!);
      formData.append('job_description', jobDescription);
      formData.append('difficulty', difficulty); // Sending difficulty

      const response = await fetch(`${API_BASE_URL}/upload-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Backend upload failed");
      setView('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
      console.error('Error starting interview:', error);
      alert("Could not connect to the backend. Please check if the backend is running and configured correctly.");

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndInterview = (history: { role: string, text: string }[]) => {
    setChatHistory(history);
    setView('report');
  };

  // --- 4. Report View ---
  if (view === 'report') {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex flex-col font-sans">
        {/* Navbar removed globally */}
        <div className="flex-1 p-4 md:p-8">
          {/* Report Component will be rendered here. 
               Using a placeholder for now until I create the file in the next step. 
           */}
          <Report
            onRestart={() => setView('landing')}
            chatHistory={chatHistory}
            jobDescription={jobDescription}
          />
        </div>
      </div>
    );
  }

  // --- 3. Interview View (Full Screen) ---
  if (view === 'interview') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col font-sans overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505]">
        {/* Navbar removed as requested */}

        <div className="flex-1 flex items-center justify-center p-6 h-screen">
          <div className="w-full max-w-[95rem] h-[92vh] grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Context (3/12 width) - RESIZED */}
            <div className="lg:col-span-3 flex flex-col h-full">
              <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl relative group/context max-h-[60vh]">
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

                <div className="p-6 pb-4 border-b border-white/5 flex items-center gap-3 relative shrink-0">
                  <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg tracking-tight text-white">Interview Context</h2>
                    <p className="text-xs text-gray-400 font-medium">Resume & Job Analysis</p>
                  </div>
                </div>

                <div className="overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
                  {/* Resume Card */}
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest pl-1">Resume</label>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 blur-2xl rounded-full" />
                      </div>

                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-[#1e1e24] border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <span className="text-xs font-bold text-red-400 font-mono">PDF</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium text-gray-200 text-sm group-hover:text-white transition-colors">
                            {selectedFile?.name || "resume.pdf"}
                          </span>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Analyzed & Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Description Card -- CONDENSED */}
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest pl-1">Target Role</label>
                    <div className="bg-gradient-to-b from-white/5 to-transparent p-5 rounded-2xl border border-white/5 relative overflow-hidden transition-all duration-300">
                      <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed font-light opacity-90 relative z-10">
                        {isJobDescExpanded ? jobDescription : (
                          <>
                            {jobDescription.slice(0, 150)}
                            {jobDescription.length > 150 && "..."}
                          </>
                        )}
                      </p>

                      {jobDescription.length > 150 && (
                        <button
                          onClick={() => setIsJobDescExpanded(!isJobDescExpanded)}
                          className="mt-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-wide flex items-center gap-1"
                        >
                          {isJobDescExpanded ? "Show Less" : "Read More"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hint Box - Fills the empty space */}
              <div className="flex-1 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl relative group/hint p-6 space-y-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Hint Context</h3>
                    <p className="text-[10px] text-gray-400">AI Assistance</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  {!hint ? (
                    <div className="space-y-3">
                      <p className="text-xs text-gray-500">Need help with the current question?</p>
                      <button
                        onClick={handleGetHint}
                        disabled={isGettingHint || !currentQuestion}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGettingHint ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                          </span>
                        ) : "Get Hint"}
                      </button>
                    </div>
                  ) : (
                    <div className="w-full text-left bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4 animate-in fade-in zoom-in duration-300">
                      <p className="text-xs text-gray-200 leading-relaxed italic">
                        "{hint}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column: Video (6/12 width) - Expanded to take more space */}
            <div className="lg:col-span-6 flex flex-col h-full relative group">
              <div className="flex-1 bg-black/60 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl ring-1 ring-white/5 flex flex-col">
                <div className="flex-1 relative">
                  <VideoAnalysis />
                </div>
              </div>
            </div>

            {/* Right Column: Chat (3/12 width) */}
            <div className="lg:col-span-3 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden h-full shadow-2xl">
              <ChatBox onEnd={handleEndInterview} onAiMessage={handleAiMessage} />
            </div>

          </div>
        </div>
      </div>
    );
  }

  // --- 2. Setup View (Form) ---
  return (
    <div className="min-h-screen bg-[#0b0b0b] flex flex-col font-sans text-gray-100">
      {/* Navbar removed globally as requested */}

      <main className="flex-1 flex flex-col">
        {view === 'landing' && (
          <Hero onStartConfirm={() => setView('setup')} />
        )}

        {view === 'setup' && (
          <div className="flex-1 flex items-center justify-center p-4 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-2xl w-full">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-white mb-2">
                  <span className="text-[#4ade80]">HireByte</span> Setup
                </h1>
                <p className="text-gray-400">Upload your resume to personalize the AI interview.</p>
              </div>

              <div className="space-y-8">
                <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Job Description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job requirements..."
                    rows={4}
                    className="w-full px-4 py-3 bg-[#161616] border border-white/10 rounded-xl text-gray-200 outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-gray-600 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-300">Interview Difficulty</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${difficulty === level
                          ? 'bg-[#4ade80] text-black shadow-lg shadow-green-900/20'
                          : 'bg-[#161616] text-gray-400 border border-white/5 hover:bg-white/5 hover:text-gray-200'
                          }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center">Standard interview, balanced difficulty</p>
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${isFormValid && !isSubmitting
                    ? 'bg-blue-900/50 hover:bg-blue-800/50 text-blue-100 border border-blue-500/30 shadow-lg shadow-blue-900/20'
                    : 'bg-[#161616] text-gray-600 cursor-not-allowed border border-white/5'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Interview</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {view === 'landing' && <Footer />}
    </div>
  );
}

export default App;