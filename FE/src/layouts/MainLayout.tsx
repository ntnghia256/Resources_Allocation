import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderGit2, 
  CalendarRange, 
  BrainCircuit, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Database,
  CloudLightning
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { theme, toggleTheme, usingMockData } = useAppStore();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Bảng Điều Khiển', path: '/', icon: LayoutDashboard },
    { name: 'Nhân Sự', path: '/employees', icon: Users },
    { name: 'Dự Án', path: '/projects', icon: FolderGit2 },
    { name: 'Phân Bổ Nhân Sự', path: '/allocations', icon: CalendarRange },
    { name: 'Trợ Lý AI', path: '/ai', icon: BrainCircuit },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-50">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-blue-600 dark:text-blue-500 animate-pulse" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Resource Allocation
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
        flex flex-col z-40 shadow-lg
      `}>
        {/* Logo Section */}
        <div className="hidden md:flex items-center space-x-2 px-6 py-6 border-b border-slate-200 dark:border-slate-800">
          <BrainCircuit className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            ResAlloc AI
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Connection Status */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">Giao diện:</span>
            <button 
              onClick={toggleTheme} 
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:scale-105 transition-transform"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
          </div>

          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold ${
            usingMockData 
              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30'
              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30'
          }`}>
            {usingMockData ? (
              <>
                <Database className="h-3.5 w-3.5 animate-bounce" />
                <span>Chế độ: Mock Data Offline</span>
              </>
            ) : (
              <>
                <CloudLightning className="h-3.5 w-3.5 animate-pulse" />
                <span>Chế độ: Backend Online</span>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:pl-64 min-h-screen flex flex-col">
        <div className="flex-1 px-4 md:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Overlay for Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
        />
      )}
    </div>
  );
};
