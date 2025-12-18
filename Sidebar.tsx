
import React from 'react';
import { LayoutDashboard, Search, Image, MessageSquare, ShieldCheck, FolderOpen, Headphones, ShieldAlert, LogOut } from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Global Search', icon: Search },
    { id: 'analyzer', label: 'Design Analysis', icon: Image },
    { id: 'takedown', label: 'DMCA Takedown', icon: ShieldAlert },
    { id: 'filing', label: 'Filing Center', icon: FolderOpen },
    { id: 'consultant', label: 'Live Expert', icon: Headphones },
    { id: 'chat', label: 'Legal AI Chat', icon: MessageSquare },
  ];

  return (
    <div className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full z-10">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight text-slate-800">MarkGuard AI</span>
      </div>

      <nav className="flex-1 mt-6 px-3 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`w-full flex items-center p-3 mb-2 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm shadow-blue-100'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="ml-3 hidden md:block">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100 space-y-4">
        <div className="hidden md:block p-4 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Pro Account</p>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4 transition-all duration-1000"></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">15/20 filings remaining</p>
        </div>

        <button 
          onClick={() => setActiveTab('landing')}
          className="w-full flex items-center p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-3 hidden md:block text-sm font-semibold">Exit to Website</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
