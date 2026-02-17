import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { Loader2, ArrowRight, Brain, Code, Globe, Sparkles } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { ConsentModal } from '../components/ConsentModal';

type InterviewMode = 'resume' | 'topic';
type TopicOption = 'AI_ML' | 'DSA' | 'WEB_DEV';

const TOPIC_OPTIONS: { key: TopicOption; label: string; icon: React.ReactNode; description: string }[] = [
    { key: 'AI_ML', label: 'AI / ML', icon: <Brain size={24} />, description: 'Machine Learning, Neural Networks, NLP' },
    { key: 'DSA', label: 'DSA', icon: <Code size={24} />, description: 'Arrays, Trees, Graphs, DP' },
    { key: 'WEB_DEV', label: 'Web Dev', icon: <Globe size={24} />, description: 'React, Node.js, System Design' },
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
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 relative">
             {/* Ambient Background */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-lg glass-panel rounded-2xl p-8 relative z-10">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="text-emerald-500" size={24} />
                        <span className="text-white">Session Setup</span>
                    </h2>
                    <p className="text-neutral-400 text-sm">Configure your AI interview environment.</p>
                </div>

                <div className="space-y-8">
                    {/* Mode Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                        <button
                            onClick={() => setInterviewMode('resume')}
                            className={`py-3 px-4 rounded-lg text-sm font-bold transition-all ${interviewMode === 'resume'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                        >
                            Resume & JD
                        </button>
                        <button
                            onClick={() => setInterviewMode('topic')}
                            className={`py-3 px-4 rounded-lg text-sm font-bold transition-all ${interviewMode === 'topic'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                : 'text-neutral-500 hover:text-neutral-300'
                                }`}
                        >
                            Topic Focus
                        </button>
                    </div>

                    {/* Resume Mode */}
                    {interviewMode === 'resume' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <FileUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Job Context</label>
                                <textarea
                                    className="input-field w-full min-h-[120px] resize-none"
                                    placeholder="Paste job description or key requirements here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Topic Mode */}
                    {interviewMode === 'topic' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Target Domain</label>
                            <div className="grid grid-cols-3 gap-3">
                                {TOPIC_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setSelectedTopic(opt.key)}
                                        className={`glass-button p-4 rounded-xl flex flex-col items-center gap-3 transition-all ${selectedTopic === opt.key
                                            ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/10 text-white'
                                            : 'text-neutral-400 hover:text-white'
                                            }`}
                                    >
                                        <div className={selectedTopic === opt.key ? 'text-emerald-400' : 'text-neutral-500'}>
                                            {opt.icon}
                                        </div>
                                        <span className="text-xs font-bold">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                            {selectedTopic && (
                                <p className="text-xs text-emerald-400/80 text-center font-medium bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                                    {TOPIC_OPTIONS.find(o => o.key === selectedTopic)?.description}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Difficulty Selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider ml-1">Intensity Level</label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['easy', 'medium', 'hard'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`py-2 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${difficulty === level
                                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                                        : 'bg-black/30 border-white/10 text-neutral-500 hover:border-white/20'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleStartInterviewClick}
                        disabled={!canStart || isSubmitting}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all 
                        disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <span>Start Session <ArrowRight size={18} className="inline ml-1" /></span>}
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
