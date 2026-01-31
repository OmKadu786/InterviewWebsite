import { Sparkles, Download, Share2, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';

interface ReportProps {
    onRestart: () => void;
}

export function Report({ onRestart }: ReportProps) {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>Interview Completed</span>
                </div>
                <h1 className="text-4xl font-bold text-white">Interview Report</h1>
                <p className="text-gray-400 max-w-lg mx-auto">
                    Here is a detailed breakdown of your performance. AI analysis suggests areas for improvement and highlights your strengths.
                </p>
            </div>

            {/* Main Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-[#161616] rounded-2xl border border-white/5 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-32 h-32 text-blue-500" />
                    </div>

                    <h3 className="text-lg font-medium text-gray-300 mb-6">Overall Score</h3>
                    <div className="flex items-end gap-4">
                        <span className="text-6xl font-bold text-white">85</span>
                        <span className="text-xl text-gray-500 mb-2">/ 100</span>
                    </div>

                    <div className="mt-8 space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Technical Accuracy</span>
                                <span className="text-white">90%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[90%] rounded-full"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Communication</span>
                                <span className="text-white">80%</span>
                            </div>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 w-[80%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                    <div className="bg-[#161616] p-6 rounded-2xl border border-white/5">
                        <h4 className="text-sm text-gray-400 mb-2">Duration</h4>
                        <p className="text-2xl font-bold text-white">45m 12s</p>
                    </div>
                    <div className="bg-[#161616] p-6 rounded-2xl border border-white/5">
                        <h4 className="text-sm text-gray-400 mb-2">Questions Answered</h4>
                        <p className="text-2xl font-bold text-white">12 / 12</p>
                    </div>
                </div>
            </div>

            {/* Feedback Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#161616] rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center gap-2 mb-4 text-green-400">
                        <CheckCircle className="w-5 h-5" />
                        <h3 className="font-semibold">Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            "Strong understanding of React hooks and patterns",
                            "Clear communication of thought process",
                            "Good error handling strategies"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-3 text-gray-300 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-[#161616] rounded-2xl border border-white/5 p-6">
                    <div className="flex items-center gap-2 mb-4 text-yellow-500">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="font-semibold">Areas for Improvement</h3>
                    </div>
                    <ul className="space-y-3">
                        {[
                            "Could elaborate more on system design scalability",
                            "Consider mentioning alternative approaches earlier",
                            "Watch out for edge cases in algorithm implementation"
                        ].map((item, i) => (
                            <li key={i} className="flex gap-3 text-gray-300 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
                <button
                    onClick={onRestart}
                    className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Start New Interview
                </button>
                <button className="px-6 py-3 bg-[#161616] text-white font-semibold rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
                <button className="px-6 py-3 bg-[#161616] text-white font-semibold rounded-xl border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Result
                </button>
            </div>

        </div>
    );
}
