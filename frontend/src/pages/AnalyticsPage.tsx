import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CandidateReport } from '../components/Analytics/CandidateReport';
import { WeaknessReport } from '../components/Analytics/WeaknessReport';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { Clock, Award, ChevronRight, ArrowLeft } from 'lucide-react';

interface InterviewRecord {
    id: string;
    role_title: string;
    created_at: string;
    performance_score: number;
    status: string;
}

export const AnalyticsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [history, setHistory] = useState<InterviewRecord[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (user) {
            fetchHistory();

            // Check for direct report access via URL
            const directId = searchParams.get('id');
            if (directId) {
                handleViewReport(directId);
            }
        } else {
            setLoading(false);
        }
    }, [user, searchParams]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API_ENDPOINTS.analytics}/../user/${user?.id}/interviews`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data.interviews || []);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.analytics}/../interview/${id}/analytics`);
            if (res.ok) {
                const data = await res.json();
                setReportData(data);
                setSelectedId(id);
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (selectedId) {
            setSelectedId(null);
            setReportData(null);
        } else {
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full" />
            </div>
        );
    }

    // Detail View
    if (selectedId && reportData) {
        return (
            <div className="min-h-screen bg-[#020617]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <button
                        onClick={handleBack}
                        className="mb-4 flex items-center gap-2 px-4 py-2 text-sm text-cyan-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10"
                    >
                        <ArrowLeft size={16} /> Back to History
                    </button>
                    <CandidateReport analyticsData={reportData} interviewId={selectedId} />
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="min-h-screen bg-[#020617] text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
                            Interview History
                        </h1>
                        <p className="text-gray-400 mt-1">Track your progress and review past performance</p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Home
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                        <Award size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-white">No interviews yet</h3>
                        <p className="text-gray-400 mt-2">Complete your first interview to see analytics here.</p>
                        <button
                            onClick={() => navigate('/setup')}
                            className="mt-6 px-6 py-3 bg-cyan-500 text-black font-semibold rounded-xl hover:bg-cyan-400 transition-colors"
                        >
                            Start Interview
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((interview) => (
                            <div
                                key={interview.id}
                                onClick={() => handleViewReport(interview.id)}
                                className="group relative bg-[#0B1120] border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium">
                                        {interview.role_title}
                                    </div>
                                    <div className="text-gray-500 text-xs flex items-center gap-1">
                                        <Clock size={12} />
                                        {new Date(interview.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="text-4xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                                        {Math.round(interview.performance_score)}
                                        <span className="text-lg text-gray-500 font-normal">/100</span>
                                    </div>
                                    <p className="text-sm text-gray-400">Overall Score</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">View Report</span>
                                    <ChevronRight size={16} className="text-gray-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Award className="text-amber-400" size={20} />
                        Weakness Analysis
                    </h2>
                    <WeaknessReport />
                </div>
            </div>
        </div>
    );
};
