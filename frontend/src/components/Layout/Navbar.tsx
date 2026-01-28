import { Menu } from 'lucide-react';
import { useState } from 'react';

export const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0b0b]/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10">
                        <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-wide hidden sm:block">AlphaByte</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <a href="#" className="hover:text-white transition-colors">Interview Prep</a>
                    <a href="#" className="hover:text-white transition-colors">Courses</a>
                    <a href="#" className="hover:text-white transition-colors">Playlists</a>
                    <a href="#" className="hover:text-white transition-colors">Live Classes</a>
                    <a href="#" className="hover:text-white transition-colors">Blog</a>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                        Login
                    </button>
                    <button
                        className="md:hidden text-white p-2"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-[#0b0b0b] border-b border-white/5 border-t">
                    <div className="flex flex-col p-4 space-y-4 text-gray-300">
                        <a href="#" className="hover:text-white">Interview Prep</a>
                        <a href="#" className="hover:text-white">Courses</a>
                        <a href="#" className="hover:text-white">Playlists</a>
                        <a href="#" className="hover:text-white">Live Classes</a>
                        <a href="#" className="hover:text-white">Blog</a>
                        <div className="pt-4 border-t border-white/5">
                            <button className="w-full bg-white text-black py-2 rounded-lg font-semibold">Login</button>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
