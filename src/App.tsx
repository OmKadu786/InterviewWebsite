import { useState } from 'react';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ChatBox } from './components/Interview/ChatBox';
import { VideoAnalysis } from './components/VideoInterview/VideoAnalysis';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Hero } from './components/Home/Hero';

function App() {
  const [view, setView] = useState<'landing' | 'setup' | 'interview'>('landing');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = selectedFile !== null && jobDescription.trim().length > 0;

  const handleStartInterview = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile!);
      formData.append('job_description', jobDescription);

      const response = await fetch('http://localhost:8000/upload-resume', {
        method: 'POST',
        body: formData,
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

  // --- 1. Interview View (Full Screen) ---
  if (view === 'interview') {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex flex-col">
        <Navbar />
        <div className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-8rem)]">
            {/* Left Column: Chat */}
            <div className="h-full bg-[#161616] rounded-2xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
              <div className="p-4 border-b border-white/5 bg-[#161616]">
                <h2 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Live Interview
                </h2>
              </div>
              <div className="flex-1 overflow-hidden relative">
                <ChatBox onEnd={() => setView('landing')} />
              </div>
            </div>

            {/* Right Column: Video & Stats */}
            <div className="h-full flex flex-col gap-6">
              <div className="flex-1 min-h-0 bg-[#161616] rounded-2xl border border-white/5 p-1 overflow-hidden shadow-2xl">
                <VideoAnalysis />
              </div>

              <div className="p-6 bg-blue-900/10 rounded-xl border border-blue-500/20 text-sm text-blue-300">
                <p className="flex items-start gap-2">
                  <span className="text-lg">💡</span>
                  Ensure your face is clearly visible. The AI analyzes your expressions to provide feedback on your confidence and engagement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 2. Main Layout (Landing & Setup) ---
  return (
    <div className="min-h-screen bg-[#0b0b0b] flex flex-col font-sans text-gray-100">
      <Navbar />

      <main className="flex-1 flex flex-col">
        {view === 'landing' && (
          <Hero onStartConfirm={() => setView('setup')} />
        )}

        {view === 'setup' && (
          <div className="flex-1 flex items-center justify-center p-4 pt-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl w-full">
              <button onClick={() => setView('landing')} className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={20} className="mr-2" />
                Back to Home
              </button>

              <div className="flex items-center space-x-3 mb-12">
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Setup Interview</h1>
                  <p className="text-gray-400 mt-1">Upload your resume and job description to personalize the AI context.</p>
                </div>
              </div>

              <div className="bg-[#161616] border border-white/5 rounded-2xl p-8 shadow-2xl">
                <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />

                <div className="mt-8 space-y-3">
                  <label className="block text-sm font-medium text-gray-300">Job Description / Requirements</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job requirements here..."
                    rows={6}
                    className="w-full px-4 py-3 bg-[#0b0b0b] border border-white/10 rounded-xl text-gray-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                  />
                </div>

                <button
                  onClick={handleStartInterview}
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full mt-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${isFormValid && !isSubmitting
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-[#222] text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  <span>Start Interview Session</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;