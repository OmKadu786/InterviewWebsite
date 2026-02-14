import { Menu, LogIn, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b0b0b]/80 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg border border-white/10">
                        <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-wide hidden sm:block">HireByte</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                    <a href="#" className="hover:text-white transition-colors">Features</a>
                    <a href="#" className="hover:text-white transition-colors">Pricing</a>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <button
                            onClick={() => navigate('/profile')}
                            className="hidden md:flex items-center gap-2 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-600/30 transition-all"
                        >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/auth')}
                            className="hidden md:flex items-center gap-2 bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Login</span>
                        </button>
                    )}

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
                        <Link to="/" className="hover:text-white" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <a href="#" className="hover:text-white">Features</a>
                        <a href="#" className="hover:text-white">Pricing</a>
                        <div className="pt-4 border-t border-white/5">
                            {user ? (
                                <button
                                    onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    <User className="w-4 h-4" /> Profile
                                </button>
                            ) : (
                                <button
                                    onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                                    className="w-full bg-white text-black py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-4 h-4" /> Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};
