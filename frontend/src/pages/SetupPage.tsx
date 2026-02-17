import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { Loader2, ArrowRight, Brain, Code, Globe } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { ConsentModal } from '../components/ConsentModal';

type InterviewMode = 'resume' | 'topic';
type TopicOption = 'AI_ML' | 'DSA' | 'WEB_DEV';

const TOPIC_OPTIONS: { key: TopicOption; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'AI_ML', label: 'AI / ML', icon: <Brain size={28} />, description: 'Machine Learning, Neural Networks, NLP, Computer Vision' },
    { key: 'DSA', label: 'DSA', icon: <Code size={28} />, description: 'Arrays, Trees, Graphs, DP, Sorting, Searching' },
    { key: 'WEB_DEV', label: 'Web Dev', icon: <Globe size={28} />, description: 'HTML/CSS, JavaScript, React, APIs, Full-Stack' },
];

export const SetupPage: React.FC = () => {
    const navigate = useNavigate();
    const [interviewMode, setInterviewMode] = useState<InterviewMode>('resume');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<TopicOption | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [consentGiven, setConsentGiven] = useState(() => {
        return localStorage.getItem('aiConsent') === 'true';
    });

    const canStart = interviewMode === 'resume'
        ? (selectedFile && jobDescription)
        : (selectedTopic !== null);

    const handleStartInterviewClick = () => {
        if (!canStart) return;

        if (consentGiven) {
            proceedWithInterview();
        } else {
            setShowConsentModal(true);
        }
    };

    const handleConsentAgree = () => {
        setConsentGiven(true);
        localStorage.setItem('aiConsent', 'true');
        setShowConsentModal(false);
        proceedWithInterview();
    };

    const proceedWithInterview = async () => {
        setIsSubmitting(true);
        try {
            if (interviewMode === 'resume') {
                // Existing resume upload flow
                const formData = new FormData();
                formData.append('file', selectedFile!);
                formData.append('job_description', jobDescription);
                formData.append('difficulty', difficulty);

                const response = await fetch(API_ENDPOINTS.uploadResume, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) throw new Error("Backend upload failed");

                navigate('/interview', {
                    state: {
                        selectedFile,
                        jobDescription,
                        difficulty,
                        interviewMode: 'resume'
                    }
                });
            } else {
                // Topic-based interview flow
                const response = await fetch(API_ENDPOINTS.startTopicInterview, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: selectedTopic,
                        difficulty: difficulty,
                    }),
                });

                if (!response.ok) throw new Error("Backend topic setup failed");

                navigate('/interview', {
                    state: {
                        selectedTopic,
                        difficulty,
                        interviewMode: 'topic'
                    }
                });
            }
        } catch (error) {
            console.error('Error starting interview:', error);
            alert(`Connection Error: ${error}\n\nPlease check console for details.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold mb-2">
                        <span className="text-hirebyte-mint">HireByte</span> Setup
                    </h2>
                    <p className="text-muted-foreground">Choose your interview mode to get started.</p>
                </div>

                <div className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/30 rounded-xl">
                        <button
                            onClick={() => setInterviewMode('resume')}
                            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${interviewMode === 'resume'
                                ? 'bg-hirebyte-mint text-white shadow-md'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            📄 Resume Upload
                        </button>
                        <button
                            onClick={() => setInterviewMode('topic')}
                            className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${interviewMode === 'topic'
                                ? 'bg-hirebyte-mint text-white shadow-md'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            🎯 Topic Practice
                        </button>
                    </div>

                    {/* Resume Mode */}
                    {interviewMode === 'resume' && (
                        <>
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
                        </>
                    )}

                    {/* Topic Mode */}
                    {interviewMode === 'topic' && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Select Interview Topic</label>
                            <div className="grid grid-cols-3 gap-3">
                                {TOPIC_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setSelectedTopic(opt.key)}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all ${selectedTopic === opt.key
                                            ? 'bg-hirebyte-mint/10 border-hirebyte-mint text-hirebyte-mint shadow-md shadow-hirebyte-mint/10'
                                            : 'bg-secondary/30 border-border hover:border-hirebyte-mint/50 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {opt.icon}
                                        <span className="text-sm font-semibold">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                            {selectedTopic && (
                                <p className="text-xs text-muted-foreground text-center animate-in fade-in">
                                    {TOPIC_OPTIONS.find(o => o.key === selectedTopic)?.description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Difficulty Selector (both modes) */}
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
                        disabled={!canStart || isSubmitting}
                        className="w-full py-3 bg-gradient-to-r from-hirebyte-blue to-hirebyte-blue-light text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:from-hirebyte-mint hover:to-emerald-500 transition-all duration-300 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <span>Start Interview <ArrowRight size={18} className="inline ml-1" /></span>}
                    </button>
                </div>
            </div>

            <ConsentModal
                isOpen={showConsentModal}
                onAgree={handleConsentAgree}
                onCancel={() => setShowConsentModal(false)}
            />
        </div>
    );
};
