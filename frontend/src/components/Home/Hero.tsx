import { ArrowRight, Brain, Sparkles, BarChart3 } from 'lucide-react';

interface HeroProps {
    onStartConfirm: () => void;
}

export const Hero = ({ onStartConfirm }: HeroProps) => {
    return (
        <section className="relative min-h-screen pt-20 flex flex-col justify-center items-center px-6 overflow-hidden">
            {/* Background Gradients - HireByte Colors */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-hirebyte-blue/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-hirebyte-mint/15 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto text-center relative z-10">
                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4 leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-hirebyte-mint to-emerald-400">HireByte</span>
                </h1>
                <p className="text-2xl md:text-3xl font-medium text-gray-300 mb-4">
                    Your AI Interview Assistant
                </p>

                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12">
                    Practice interviews with AI-powered feedback, real-time body language analysis, 
                    and comprehensive performance analytics. Ace your next interview.
                </p>

                {/* Feature Cards Grid */}
                <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                        <Brain className="w-8 h-8 text-hirebyte-mint mb-2" />
                        <h3 className="font-semibold text-white text-sm">AI Interviewer</h3>
                        <p className="text-xs text-gray-500">Dynamic questions based on your resume</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                        <Sparkles className="w-8 h-8 text-hirebyte-blue-light mb-2" />
                        <h3 className="font-semibold text-white text-sm">Vision Analysis</h3>
                        <p className="text-xs text-gray-500">Eye contact, confidence & emotion tracking</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                        <BarChart3 className="w-8 h-8 text-hirebyte-mint mb-2" />
                        <h3 className="font-semibold text-white text-sm">Detailed Reports</h3>
                        <p className="text-xs text-gray-500">Charts, insights & exportable PDF</p>
                    </div>
                </div>

                {/* Featured Card - Start Interview */}
                <div 
                    className="max-w-sm mx-auto bg-gradient-to-br from-hirebyte-blue/20 to-hirebyte-mint/10 border border-hirebyte-mint/30 rounded-2xl p-6 text-left hover:border-hirebyte-mint/60 transition-all duration-300 group cursor-pointer relative overflow-hidden shadow-xl shadow-hirebyte-blue/10" 
                    onClick={onStartConfirm}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-hirebyte-mint/0 to-hirebyte-mint/0 group-hover:from-hirebyte-mint/5 group-hover:to-hirebyte-blue/5 transition-all" />

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 rounded-lg bg-hirebyte-mint/20 text-hirebyte-mint">
                            <Brain size={24} />
                        </div>
                        <span className="text-xs font-mono text-hirebyte-mint border border-hirebyte-mint/30 px-2 py-1 rounded bg-hirebyte-mint/10">
                            AI Powered
                        </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-hirebyte-mint transition-colors relative z-10">
                        Start Your Practice Interview
                    </h3>
                    <p className="text-sm text-gray-400 mb-6 relative z-10">
                        Software • Finance • Marketing • Any Role
                    </p>

                    <button 
                        onClick={onStartConfirm} 
                        className="w-full bg-gradient-to-r from-hirebyte-blue to-hirebyte-blue-light hover:from-hirebyte-mint hover:to-emerald-500 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg relative z-10"
                    >
                        Begin Interview
                        <ArrowRight size={16} />
                    </button>
                </div>

                {/* Trust Badges */}
                <div className="mt-12 flex items-center justify-center gap-8 text-gray-500 text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-hirebyte-mint" />
                        <span>Real-time Feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-hirebyte-mint" />
                        <span>Semantic Scoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-hirebyte-mint" />
                        <span>No Login Required</span>
                    </div>
                </div>
            </div>
        </section>
    );
};
