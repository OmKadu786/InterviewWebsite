import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUpload } from '../components/FileUpload';
import { Loader2, ArrowRight } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { ConsentModal } from '../components/ConsentModal';

export const SetupPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [consentGiven, setConsentGiven] = useState(() => {
        return localStorage.getItem('aiConsent') === 'true';
    });

    const handleStartInterviewClick = () => {
        if (!selectedFile || !jobDescription) return;

        if (consentGiven) {
            proceedWithInterview();
        } else {
            setShowConsentModal(true);
        }
    };

    const handleConsentAgree = () => {
        setConsentGiven(true);
        setShowConsentModal(false);
        proceedWithInterview();
    };

    const proceedWithInterview = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile!);
            formData.append('job_description', jobDescription);
            formData.append('difficulty', difficulty);

            const response = await fetch(API_ENDPOINTS.uploadResume, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error("Backend upload failed");

            // Pass state to the interview page usually via context or location state
            // For now, we'll store basic info in localStorage or rely on backend session
            // But since the original App.tsx relied on local state, we should probably pass it via navigation state
            navigate('/interview', {
                state: {
                    selectedFile,
                    jobDescription,
                    difficulty
                }
            });

        } catch (error) {
            console.error('Error starting interview:', error);
            alert(`Connection Error: ${error}\n\nCould not connect to: ${API_ENDPOINTS.uploadResume}\n\nPlease check console for details.`);
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

            <ConsentModal
                isOpen={showConsentModal}
                onAgree={handleConsentAgree}
                onCancel={() => setShowConsentModal(false)}
            />
        </div>
    );
};
