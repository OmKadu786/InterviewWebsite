import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout/Layout';
import { VideoAnalysis } from './components/VideoInterview/VideoAnalysis';
import { ChatBox } from './components/Interview/ChatBox';
import { FileUpload } from './components/FileUpload';
import { CandidateReport } from './components/Analytics/CandidateReport';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { Hero } from './components/Home/Hero';
import { API_ENDPOINTS } from './config/api';

type ViewState = 'landing' | 'setup' | 'interview' | 'analytics';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleStartInterview = async () => {
    if (!selectedFile || !jobDescription) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('job_description', jobDescription);
      formData.append('difficulty', difficulty);

      const headers: Record<string, string> = {};
      
      const response = await fetch(API_ENDPOINTS.uploadResume, {
        method: 'POST',
        body: formData,
        headers: headers
      });

      if (!response.ok) throw new Error("Backend upload failed");
      setView('interview');
    } catch (error) {
      console.error('Error starting interview:', error);
      alert("Make sure your Python backend is running on port 8000!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndInterview = async () => {
    // Stop the webcam when ending the interview
    try {
      await fetch(API_ENDPOINTS.stopCamera, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error stopping camera:', error);
    }
    setView('analytics');
  };

  return (
    <ThemeProvider>
        <Layout onDone={handleEndInterview} showDoneButton={view === 'interview'}>
            {view === 'landing' && <Hero onStartConfirm={() => setView('setup')} />}
            
            {view === 'setup' && (
                <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
                    <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                         <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold mb-2">
                                <span className="text-hirebyte-mint">HireByte</span> Setup
                            </h2>
                            <p className="text-muted-foreground">Upload your resume to personalize the AI interview.</p>
                        </div>
                        
                        <div className="space-y-6">
                            <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Job Description</label>
                                <textarea
                                    className="w-full p-3 bg-secondary/30 border border-input rounded-xl outline-none focus:ring-2 focus:ring-hirebyte-mint/30 min-h-[100px] resize-none"
                                    placeholder="Paste job requirements..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>

                            {/* Difficulty Level Selector */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interview Difficulty</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                                                difficulty === level 
                                                    ? 'bg-hirebyte-mint text-white border-hirebyte-mint' 
                                                    : 'bg-secondary/30 border-border hover:border-hirebyte-mint/50'
                                            }`}
                                        >
                                            {level.charAt(0).toUpperCase() + level.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {difficulty === 'easy' && 'Basic questions, friendly tone'}
                                    {difficulty === 'medium' && 'Standard interview, balanced difficulty'}
                                    {difficulty === 'hard' && 'Challenging questions, rigorous assessment'}
                                </p>
                            </div>

                            <button
                                onClick={handleStartInterview}
                                disabled={!selectedFile || !jobDescription || isSubmitting}
                                className="w-full py-3 bg-gradient-to-r from-hirebyte-blue to-hirebyte-blue-light text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-hirebyte-mint hover:to-emerald-500 transition-all duration-300 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <span>Start Interview <ArrowRight size={18} className="inline ml-1"/></span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {view === 'interview' && (
                <div className="h-[calc(100vh-4rem)] p-4 md:p-6 overflow-hidden relative">
                    <div className="max-w-[1920px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* Left Panel: Context & Inputs */}
                        <div className="lg:col-span-3 h-full flex flex-col gap-4 bg-card/30 border border-border/50 rounded-2xl p-4 overflow-y-auto backdrop-blur-sm">
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
                                    <Sparkles size={16} className="text-hirebyte-mint"/> 
                                    Interview Setup
                                </h3>
                                <p className="text-xs text-muted-foreground">Resume & Job Analysis</p>
                            </div>
                            
                            <div className="p-3 bg-secondary/50 rounded-xl text-sm border border-border/50">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Resume</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center text-xs font-bold">PDF</div>
                                    <span className="truncate flex-1">{selectedFile?.name || "resume.pdf"}</span>
                                </div>
                            </div>

                             <div className="p-3 bg-secondary/50 rounded-xl text-sm border border-border/50 flex-1 overflow-hidden flex flex-col">
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Job Description</span>
                                <p className="text-muted-foreground text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap">
                                    {jobDescription || "No description provided."}
                                </p>
                            </div>
                        </div>
                        
                        {/* Center Panel: Video Stream */}
                        <div className="lg:col-span-6 h-full flex flex-col">
                             <VideoAnalysis />
                        </div>
                        
                        {/* Right Panel: Chat */}
                        <div className="lg:col-span-3 h-full">
                            <ChatBox onEnd={handleEndInterview} />
                        </div>

                    </div>
                </div>
            )}

            {view === 'analytics' && (
                <div className="min-h-screen">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <button
                            onClick={() => setView('landing')}
                            className="mb-4 px-4 py-2 text-sm text-hirebyte-mint hover:text-white transition-colors"
                        >
                            ← Back to Home
                        </button>
                        <CandidateReport />
                    </div>
                </div>
            )}
        </Layout>
    </ThemeProvider>
  );
}

export default App;