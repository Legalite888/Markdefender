
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrademarkSearchTool from './components/TrademarkSearchTool';
import BrandAnalyzer from './components/BrandAnalyzer';
import ChatAssistant from './components/ChatAssistant';
import FilingCenter from './components/FilingCenter';
import LiveConsultant from './components/LiveConsultant';
import TakedownCenter from './components/TakedownCenter';
import LandingPage from './components/LandingPage';
import { TabType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('landing');

  // Dynamic SEO Metadata
  useEffect(() => {
    const metaDescriptions: Record<TabType, string> = {
      landing: "Welcome to MarkGuard AI. Protect your intellectual property with AI-powered search and enforcement.",
      dashboard: "Your IP Portfolio Dashboard. Track filings and office actions in real-time.",
      search: "Global Trademark Viability Search. AI-powered conflict analysis across major jurisdictions.",
      analyzer: "Design & Logo Analyzer. Check your brand mark's distinctiveness and legality.",
      filing: "IP Filing Center. Manage and analyze legal documents and brand assets.",
      consultant: "Live Voice AI Consultant. High-priority IP strategy sessions.",
      chat: "Legal AI Chat Assistant. Instant answers to trademark law questions.",
      takedown: "DMCA Takedown Center. Generate legal notices and analyze infringement similarity."
    };

    const titles: Record<TabType, string> = {
      landing: "MarkGuard AI | Global IP Protection",
      dashboard: "Dashboard | MarkGuard AI",
      search: "Global Trademark Search | MarkGuard AI",
      analyzer: "Logo Analyzer | MarkGuard AI",
      filing: "Filing Center | MarkGuard AI",
      consultant: "Live Consultant | MarkGuard AI",
      chat: "Legal AI Assistant | MarkGuard AI",
      takedown: "DMCA Takedown | MarkGuard AI"
    };

    document.title = titles[activeTab];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", metaDescriptions[activeTab]);
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage onEnter={() => setActiveTab('dashboard')} />;
      case 'dashboard':
        return <Dashboard onStartSearch={() => setActiveTab('search')} />;
      case 'search':
        return <TrademarkSearchTool />;
      case 'analyzer':
        return <BrandAnalyzer />;
      case 'filing':
        return <FilingCenter />;
      case 'consultant':
        return <LiveConsultant />;
      case 'chat':
        return <ChatAssistant />;
      case 'takedown':
        return <TakedownCenter />;
      default:
        return <LandingPage onEnter={() => setActiveTab('dashboard')} />;
    }
  };

  if (activeTab === 'landing') {
    return <div className="min-h-screen bg-white">{renderContent()}</div>;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 app-scrollbar">
        <div className="max-w-6xl mx-auto h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
