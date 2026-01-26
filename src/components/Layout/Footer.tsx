import { Mail, Instagram, Twitter, Send, Linkedin } from 'lucide-react';

export const Footer = () => {
    return (
        <footer className="w-full bg-[#0b0b0b] border-t border-white/5 py-12 px-6 lg:px-12 text-gray-400">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Left Column: Branding & Subscribe */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-wide">AlphaByte</span>
                    </div>
                    <p className="text-sm leading-relaxed max-w-xs">
                        Empowering your career with AI-driven interview practice. Master your skills with real-time feedback and expert resources.
                    </p>
                    <div className="flex items-center max-w-xs relative">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full bg-[#161616] border border-white/10 rounded-lg py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button className="absolute right-2 p-1.5 bg-blue-600 rounded-md text-white hover:bg-blue-500 transition-colors">
                            <Send size={16} />
                        </button>
                    </div>
                </div>

                {/* Center Column: Quick Links */}
                <div className="md:ml-auto">
                    <h3 className="text-white font-semibold mb-6">Courses</h3>
                    <ul className="space-y-4 text-sm">
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Upcoming courses</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Feedback</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
                    </ul>
                </div>

                {/* Right Column: Socials */}
                <div className="md:ml-auto">
                    <div className="flex gap-4">
                        <SocialIcon Icon={Instagram} />
                        <SocialIcon Icon={Twitter} />
                        <SocialIcon Icon={Mail} />
                        <SocialIcon Icon={Linkedin} />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                <p>© 2024 AlphaByte Technologies. All rights reserved.</p>
                <div className="mt-4 md:mt-0 flex gap-6">
                    <a href="#" className="hover:text-gray-400">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-400">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ Icon }: { Icon: React.ElementType }) => (
    <a href="#" className="w-10 h-10 rounded-full bg-[#161616] flex items-center justify-center text-white/70 hover:bg-white hover:text-black transition-all">
        <Icon className="w-[18px] h-[18px]" />
    </a>
);
