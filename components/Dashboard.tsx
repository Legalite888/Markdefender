
import React from 'react';
import { Plus, Globe, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface DashboardProps {
  onStartSearch: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartSearch }) => {
  const activeFilings = [
    { id: 1, name: 'Lumina Tech', status: 'In Review', progress: 65, region: 'EUIPO' },
    { id: 2, name: 'EcoFlow', status: 'Search Completed', progress: 30, region: 'USPTO' },
    { id: 3, name: 'Z-Series Logo', status: 'Published', progress: 90, region: 'WIPO' },
  ];

  const handleBookExpert = () => {
    window.open('https://calendly.com', '_blank');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome back, Sarah</h1>
          <p className="text-slate-500">Manage your global intellectual property portfolio.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleBookExpert}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-slate-900 text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all active:scale-95"
          >
            <Calendar className="w-5 h-5" />
            <span>Book Consultation</span>
          </button>
          <button
            onClick={onStartSearch}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-800">12</span>
          </div>
          <h3 className="text-slate-600 font-medium">Registered Marks</h3>
          <p className="text-sm text-slate-400">Across 5 jurisdictions</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-800">4</span>
          </div>
          <h3 className="text-slate-600 font-medium">Pending Apps</h3>
          <p className="text-sm text-slate-400">Next update expected in 3 days</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-800">1</span>
          </div>
          <h3 className="text-slate-600 font-medium">Office Actions</h3>
          <p className="text-sm text-slate-400">Response required by March 15</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
        <Globe className="w-5 h-5 mr-2 text-blue-600" />
        Active Filings
      </h2>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Mark Name</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Jurisdiction</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeFilings.map((filing) => (
              <tr key={filing.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">{filing.name}</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono">{filing.region}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    filing.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {filing.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${filing.progress}%` }}></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
