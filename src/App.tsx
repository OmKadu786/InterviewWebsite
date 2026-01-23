import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ChatBox } from './components/Interview/ChatBox';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInterviewing, setIsInterviewing] = useState(false);

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
      setIsInterviewing(true);
    } catch (error) {
      console.error('Error starting interview:', error);
      alert("Make sure your Python backend is running on port 8000!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInterviewing) {
    return (
      <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
        <ChatBox onEnd={() => setIsInterviewing(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="flex items-center space-x-3 mb-12">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">AI Interviewer</h1>
            <p className="text-slate-400 mt-1">Practice live interviews without a database</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />
          <div className="mt-6 space-y-2">
            <label className="block text-sm font-medium text-slate-300">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job requirements here..."
              rows={8}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-800 rounded-lg text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleStartInterview}
            disabled={!isFormValid || isSubmitting}
            className={`w-full mt-6 py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 ${
              isFormValid && !isSubmitting ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Sparkles />}
            <span>Start Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;