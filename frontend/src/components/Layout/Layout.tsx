import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onDone?: () => void;
  showDoneButton?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onDone, showDoneButton = false }) => {
  const { theme, toggleTheme } = useTheme();

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
          {showDoneButton && onDone && (
            <button
              onClick={onDone}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-white/10 shadow-lg"
            >
              Done
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors border border-white/10 shadow-lg"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
};
