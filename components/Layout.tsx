import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Merge, Home, Minimize2, Layers, FileOutput, Image, FileImage, ShieldCheck, Scissors, ScrollText } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const tools = [
    { path: '/merge', label: 'Merge', icon: Merge },
    { path: '/split-pdf', label: 'Split', icon: Scissors },
    { path: '/compress', label: 'Compress PDF', icon: Minimize2 },
    { path: '/compress-image', label: 'Compress Img', icon: FileImage },
    { path: '/organize-pdf', label: 'Organize', icon: Layers },
    { path: '/pdf-to-text', label: 'To Text', icon: FileText },
    { path: '/pdf-to-images', label: 'To Images', icon: FileOutput },
    { path: '/images-to-pdf', label: 'Img to PDF', icon: Image },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Brand Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link to="/" className="flex items-center gap-2 group hover:text-blue-400 transition-colors">
              <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                <FileText size={20} />
              </div>
              <span className="font-bold text-lg tracking-tight">PDF Master</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                <ShieldCheck size={14} />
                <span className="hidden sm:inline">Privacy Policy</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Toolbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <nav className="flex items-center space-x-1 py-2 overflow-x-auto pb-2 md:pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
             <style>{`
                nav::-webkit-scrollbar {
                  display: none;
                }
             `}</style>
             <Link
                to="/"
                className={`shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${isActive('/') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Home size={18} />
                <span className="whitespace-nowrap">Home</span>
              </Link>
              
              <div className="h-6 w-px bg-slate-200 mx-2 shrink-0" />

              {tools.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`shrink-0 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2
                    ${isActive(item.path) 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <item.icon size={18} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              ))}
           </nav>
        </div>
      </div>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              Powered by pdf-lib. Secure client-side processing.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                <ShieldCheck size={16} />
                Privacy Policy
              </Link>
              <span className="text-slate-300">|</span>
              <Link to="/terms" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors">
                <ScrollText size={16} />
                Terms of Use
              </Link>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-400">© {new Date().getFullYear()} PDF Master</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;