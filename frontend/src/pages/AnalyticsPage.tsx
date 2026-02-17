import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CandidateReport } from '../components/Analytics/CandidateReport';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { ArrowLeft } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();

    // Simplified useEffect - no history fetching
    useEffect(() => {
        const directId = searchParams.get('id');
        if (directId) {
            handleViewReport(directId);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const handleViewReport = async (id: string) => {
        setLoading(true);
        try {
            // Fetch analytics (current session only essentially, or direct ID if we kept that valid)
            // Since history is gone, this is mostly for the immediate post-interview redirect
            const endpoint = id === 'current' || !id
                ? `${API_ENDPOINTS.analytics}`
                : `${API_ENDPOINTS.analytics}`; // Fallback to current session always since history endpoints are gone

            const res = await fetch(endpoint);
            if (res.ok) {
                const data = await res.json();
                setReportData(data);
                setSelectedId("current");
            }
        } catch (error) {
            console.error('Failed to fetch report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
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
                        <ArrowLeft size={16} /> Back to Home
                    </button>
                    <CandidateReport analyticsData={reportData} interviewId={selectedId} />
                </div>
            </div>
        );
    }

    // List View - REMOVED HISTORY
    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 flex flex-col items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent mb-4">
                    Interview Session Analytics
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto mb-8">
                    Your interview reports are available immediately after each session.
                    Please start a new interview to generate analytics.
                </p>

                <button
                    onClick={() => navigate('/setup')}
                    className="px-6 py-3 bg-cyan-500 text-black font-semibold rounded-xl hover:bg-cyan-400 transition-colors"
                >
                    Start New Interview
                </button>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};
