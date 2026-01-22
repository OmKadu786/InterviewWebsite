import { useState, useEffect } from 'react';
import { Sparkles, History, Loader2 } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { RecentActivityModal } from './components/RecentActivityModal';
import { supabase, MockInterview } from './lib/supabase';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = selectedFile !== null && jobDescription.trim().length > 0;

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('mock_interviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!isFormValid) return;

    setIsSubmitting(true);
    try {
      const roleTitle = extractRoleTitle(jobDescription);
      const mockScore = Math.floor(Math.random() * 40) + 60;

      const { error } = await supabase.from('mock_interviews').insert({
        role_title: roleTitle,
        job_description: jobDescription,
        resume_filename: selectedFile!.name,
        performance_score: mockScore,
        status: 'completed',
      });

      if (error) throw error;

      await fetchInterviews();

      setSelectedFile(null);
      setJobDescription('');

      setIsModalOpen(true);
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractRoleTitle = (description: string): string => {
    const lines = description.trim().split('\n');
    const firstLine = lines[0].trim();
    return firstLine.length > 50 ? firstLine.substring(0, 47) + '...' : firstLine;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />

      <div className="relative max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-100">AI Interviewer</h1>
              <p className="text-slate-400 mt-1">Practice interviews powered by artificial intelligence</p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all duration-200 text-slate-200"
          >
            <History className="w-5 h-5" />
            <span className="font-medium">Recent Activity</span>
            {interviews.length > 0 && (
              <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-semibold">
                {interviews.length}
              </span>
            )}
          </button>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-6">
            <FileUpload
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste or type the job description here. Include role title, responsibilities, and requirements..."
                rows={8}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
              <p className="text-sm text-slate-500">
                {jobDescription.length} characters
              </p>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={!isFormValid || isSubmitting}
              className={`
                w-full py-4 px-6 rounded-xl font-semibold text-lg
                transition-all duration-200 flex items-center justify-center space-x-2
                ${isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Starting Interview...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Start Interview</span>
                </>
              )}
            </button>

            {!isFormValid && (
              <p className="text-sm text-slate-500 text-center">
                Please upload a resume and enter a job description to continue
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>Your data is securely stored and ready for AI-powered interview practice</p>
        </div>
      </div>

      <RecentActivityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        interviews={interviews}
      />
    </div>
  );
}

export default App;
