import { CandidateReport } from '../components/Analytics/CandidateReport';
import { WeaknessReport } from '../components/Analytics/WeaknessReport';

export const AnalyticsPage = () => {
  return (
    <div className="min-h-screen bg-[#020617]">
      <CandidateReport />
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
        <WeaknessReport />
      </div>
    </div>
  );
};
