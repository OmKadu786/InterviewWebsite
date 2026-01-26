import { ArrowRight, Brain, ChevronRight } from 'lucide-react';

interface HeroProps {
    onStartConfirm: () => void;
}

export const Hero = ({ onStartConfirm }: HeroProps) => {
    return (
        <section className="relative min-h-screen pt-20 flex flex-col justify-center items-center px-6 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-semibold mb-6">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    New Feature: AI Video Analysis
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
                    Job Interview <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Practice Platform</span>
                </h1>

                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
                    Select and practice interviews for different roles and industries. Get real-time feedback on your answers and body language.
                </p>

                {/* Featured Card */}
                <div className="max-w-sm mx-auto bg-[#161616] border border-white/10 rounded-2xl p-6 text-left hover:border-blue-500/50 transition-colors group cursor-pointer relative overflow-hidden" onClick={onStartConfirm}>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all" />

                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-blue-900/20 text-blue-400">
                            <Brain size={24} />
                        </div>
                        <span className="text-xs font-mono text-gray-500 border border-white/5 px-2 py-1 rounded">Lv. 3</span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">Machine learning engineer</h3>
                    <p className="text-sm text-gray-500 mb-6">Data Science • 45 mins</p>

                    <button onClick={onStartConfirm} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-900/20">
                        Start Practice
                        <ArrowRight size={16} />
                    </button>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 text-gray-600 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>Instant Feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>Industry Standard</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>No Login Required</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
