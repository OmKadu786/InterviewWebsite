import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateReport } from '../components/Analytics/CandidateReport';
import { WeaknessReport } from '../components/Analytics/WeaknessReport';

export const AnalyticsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <button
                    onClick={() => navigate('/')}
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
    );
};
