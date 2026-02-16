import { useState, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout/Layout';
import { VideoAnalysis } from './components/VideoInterview/VideoAnalysis';
import { ChatBox } from './components/Interview/ChatBox';
import { FileUpload } from './components/FileUpload';
import { CandidateReport } from './components/Analytics/CandidateReport';
import { WeaknessReport } from './components/Analytics/WeaknessReport';
import { ConsentModal } from './components/ConsentModal';
import { WelcomeModal } from './components/WelcomeModal';
import { HintLevelButtons, HintLevel } from './components/HintLevelButtons';
import { LogicFeedback } from './components/Interview/LogicFeedback';
import { SpeechFeedback } from './components/Interview/SpeechFeedback';
import { Sparkles, Loader2, ArrowRight, Lightbulb } from 'lucide-react';
import { Hero } from './components/Home/Hero';
import { API_ENDPOINTS } from './config/api';

type ViewState = 'landing' | 'setup' | 'interview' | 'analytics';

function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentGiven, setConsentGiven] = useState(() => {
    // Check if user has previously given consent
    return localStorage.getItem('aiConsent') === 'true';
  });
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    // Show welcome modal if user hasn't agreed yet
    return localStorage.getItem('welcomeConsent') !== 'true';
  });

  // Speaking state management for overlay messages
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintTopic, setHintTopic] = useState<string | null>(null);
  const [availableHintLevel, setAvailableHintLevel] = useState<string | null>('small');

  // Feature 2 & 4: Real-time feedback state
  const [logicFeedback, setLogicFeedback] = useState<{
    issue_type: string; feedback: string; severity: 'info' | 'warning' | 'error';
  } | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<{
    wpm: number; pace: string; filler_count: number; confidence_level: string; long_silence: boolean; feedback: string;
  } | null>(null);

  // Callbacks for ChatBox to update speaking states
  const handleAISpeakingChange = useCallback((speaking: boolean) => {
    setIsAISpeaking(speaking);
  }, []);

  const handleUserSpeakingChange = useCallback((speaking: boolean) => {
    setIsUserSpeaking(speaking);
  }, []);

  // Handle hint requests - connects to LLM backend with progressive hints
  const handleHintRequest = async (level: HintLevel, prompt: string) => {
    setHintLoading(true);
    try {
      // Call backend for contextual LLM-based hints (progressive enforcement is server-side)
      const response = await fetch(API_ENDPOINTS.getHint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt, level })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentHint(data.hint || 'Focus on your relevant experience.');
        // Feature 1: Update hint availability and topic from response
        if (data.available_level !== undefined) {
          setAvailableHintLevel(data.available_level);
        }
        if (data.topic) {
          setHintTopic(data.topic);
        }
      } else {
        // Fallback hints if API fails
        const fallbackHints = {
          small: "Focus on the key skills mentioned in your resume.",
          medium: "Structure your answer: Situation, Task, Action, Result.",
          full: "Provide specific examples from your experience that match the job requirements."
        };
        setCurrentHint(fallbackHints[level]);
      }
      // Auto-clear after 45 seconds
      setTimeout(() => setCurrentHint(null), 45000);
    } catch (error) {
      console.error('Hint request error:', error);
      setCurrentHint("Consider your relevant experience for this question.");
    } finally {
      setHintLoading(false);
    }
  };

  // Feature 2: Logic feedback handler
  const handleLogicFeedback = useCallback((feedback: { issue_type: string; feedback: string; severity: string }) => {
    setLogicFeedback(feedback as any);
    // Auto-dismiss after 15 seconds
    setTimeout(() => setLogicFeedback(null), 15000);
  }, []);

  // Feature 4: Speech feedback handler
  const handleSpeechFeedback = useCallback((feedback: { wpm: number; pace: string; filler_count: number; confidence_level: string; long_silence: boolean; feedback: string }) => {
    setSpeechFeedback(feedback);
    // Auto-dismiss after 10 seconds
    setTimeout(() => setSpeechFeedback(null), 10000);
  }, []);

  // Handle the initial click on "Start Interview" - shows consent if not given
  const handleStartInterviewClick = () => {
    if (!selectedFile || !jobDescription) return;

    // If consent was already given (from localStorage), proceed directly
    if (consentGiven) {
      proceedWithInterview();
    } else {
      // Show consent modal first
      setShowConsentModal(true);
    }
  };

  // Called when user agrees in consent modal
  const handleConsentAgree = () => {
    setConsentGiven(true);
    setShowConsentModal(false);
    proceedWithInterview();
  };

  // Called when user cancels consent
  const handleConsentCancel = () => {
    setShowConsentModal(false);
  };

  // Actually start the interview (camera/mic start here)
  const proceedWithInterview = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile!);
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
      alert(`Connection Error: ${error}\n\nCould not connect to: ${API_ENDPOINTS.uploadResume}\n\nPlease check console for details.`);
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
        {view === 'landing' && (
          <>
            <Hero onStartConfirm={() => setView('setup')} />
            <WelcomeModal
              isOpen={showWelcomeModal}
              onAgree={() => setShowWelcomeModal(false)}
            />
          </>
        )}

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
                        className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${difficulty === level
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
                  onClick={handleStartInterviewClick}
                  disabled={!selectedFile || !jobDescription || isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-hirebyte-blue to-hirebyte-blue-light text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-hirebyte-mint hover:to-emerald-500 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <span>Start Interview <ArrowRight size={18} className="inline ml-1" /></span>}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'interview' && (
          <div className="h-[calc(100vh-4rem)] p-4 md:p-6 overflow-hidden relative">
            <div className="max-w-[1920px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* Left Panel: Context & Inputs */}
              <div className="lg:col-span-2 h-full min-h-0 flex flex-col gap-4 bg-card/30 border border-border/50 rounded-2xl p-4 overflow-y-auto backdrop-blur-sm">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-hirebyte-mint" />
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
                  <p className="text-muted-foreground text-xs leading-relaxed overflow-y-auto whitespace-pre-wrap flex-1">
                    {jobDescription || "No description provided."}
                  </p>
                </div>

                {/* Hints Section */}
                <div className="mt-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb size={14} className="text-yellow-400" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">AI Hints</span>
                  </div>
                  <HintLevelButtons
                    onRequestHint={handleHintRequest}
                    isLoading={hintLoading}
                    availableLevel={availableHintLevel}
                    topic={hintTopic}
                  />
                </div>
              </div>

              {/* Center Panel: Video Stream */}
              <div className="lg:col-span-7 h-full min-h-0 flex flex-col">
                <VideoAnalysis
                  isAISpeaking={isAISpeaking}
                  isUserSpeaking={isUserSpeaking}
                  currentHint={currentHint}
                />
              </div>

              {/* Right Panel: Chat + Real-time Feedback */}
              <div className="lg:col-span-3 h-full min-h-0 flex flex-col gap-2">
                {/* Feature 2: Logic Feedback */}
                <LogicFeedback
                  feedback={logicFeedback}
                  onDismiss={() => setLogicFeedback(null)}
                />
                {/* Feature 4: Speech Feedback */}
                <SpeechFeedback
                  feedback={speechFeedback}
                  onDismiss={() => setSpeechFeedback(null)}
                />
                <ChatBox
                  onEnd={handleEndInterview}
                  onAISpeakingChange={handleAISpeakingChange}
                  onUserSpeakingChange={handleUserSpeakingChange}
                  onLogicFeedback={handleLogicFeedback}
                  onSpeechFeedback={handleSpeechFeedback}
                />
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
              <div className="mt-6">
                <WeaknessReport />
              </div>
            </div>
          </div>
        )}

        {/* Consent Modal */}
        <ConsentModal
          isOpen={showConsentModal}
          onAgree={handleConsentAgree}
          onCancel={handleConsentCancel}
        />
      </Layout>
    </ThemeProvider>
  );
}

export default App;