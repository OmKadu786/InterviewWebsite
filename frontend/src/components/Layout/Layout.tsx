import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  onDone?: () => void;
  showDoneButton?: boolean;
  showLoginButton?: boolean;
  onLoginClick?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, onDone, showDoneButton = false, showLoginButton = false, onLoginClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 px-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-bold text-xl cursor-pointer hover:opacity-80 transition-opacity">
          <img
            src="/logo.png"
            alt="HireByte Logo"
            className="w-8 h-8 object-contain"
          />
          <span>HireByte</span>
        </a>

        {/* Right side buttons - opposite to HireByte logo */}
        <div className="flex items-center gap-3">


          {/* Auth Section */}
          {user ? (
            <div className="flex items-center gap-2">


              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary text-foreground pl-3 pr-4 py-1.5 rounded-full border border-border transition-colors group"
                >
                  <div className="w-7 h-7 bg-hirebyte-mint/20 text-hirebyte-mint rounded-full flex items-center justify-center">
                    <User size={14} />
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-border/50">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium truncate" title={user.email}>{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            showLoginButton && (
              <button
                onClick={onLoginClick}
                className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors shadow-lg"
              >
                Login
              </button>
            )
          )}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors border border-white/10 shadow-lg"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header >

      {/* Main Content Area */}
      < main className="flex-1 overflow-hidden" >
        {children}
      </main >
    </div >
  );
};
