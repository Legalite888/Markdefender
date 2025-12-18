
import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, AlertTriangle, ShieldAlert, ChevronRight, ExternalLink, Globe, Landmark, Activity } from 'lucide-react';
import { analyzeTrademarkViability, searchConflicts } from '../services/gemini';
import { FilingRecommendation, Jurisdiction } from '../types';

const JURISDICTIONS: Jurisdiction[] = ['USA', 'EU', 'UK', 'China', 'Japan', 'International (Madrid)'];

const TrademarkSearchTool: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<Jurisdiction[]>(['USA', 'EU', 'International (Madrid)']);
  const [recommendation, setRecommendation] = useState<FilingRecommendation | null>(null);
  const [searchContext, setSearchContext] = useState<{ text: string, sources: any[] } | null>(null);

  const toggleJurisdiction = (j: Jurisdiction) => {
    if (selectedJurisdictions.includes(j)) {
      setSelectedJurisdictions(selectedJurisdictions.filter(item => item !== j));
    } else {
      setSelectedJurisdictions([...selectedJurisdictions, j]);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !industry) return;
    
    setLoading(true);
    try {
      const [rec, context] = await Promise.all([
        analyzeTrademarkViability({ name, industry, jurisdictions: selectedJurisdictions }),
        searchConflicts(name)
      ]);
      setRecommendation(rec);
      setSearchContext(context);
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Global Viability Search</h1>
          <p className="text-slate-500">Evaluate your brand name's registration potential across WIPO, EUIPO, and USPTO.</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
            <Globe className="w-3 h-3" />
            <span>WIPO Active</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100">
            <Landmark className="w-3 h-3" />
            <span>EUIPO Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleSearch} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm sticky top-8">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Trademark Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. LuminaStream"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Industry / Business Description</label>
              <textarea
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Cloud software for renewable energy monitoring"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all h-24 resize-none"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Target Registries</label>
              <div className="flex flex-wrap gap-2">
                {JURISDICTIONS.map(j => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => toggleJurisdiction(j)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedJurisdictions.includes(j)
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {j}
                  </button>
                ))}
              </div>
            </div>
            <button
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50 shadow-xl shadow-blue-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              <span>{loading ? 'Scanning Registries...' : 'Run Global Search'}</span>
            </button>

            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Database Verification</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">WIPO Global Brand DB</span>
                  <span className="text-green-600 font-bold">Connected</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">EUIPO TMview</span>
                  <span className="text-green-600 font-bold">Connected</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">USPTO TESS</span>
                  <span className="text-green-600 font-bold">Connected</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {!recommendation && !loading && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] h-96 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-6">
                <ShieldAlert className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-slate-600 font-bold mb-2">Ready for International Scan</h3>
              <p className="max-w-xs text-sm">Our AI will cross-reference your brand name against the Madrid Protocol and European Union registries instantly.</p>
            </div>
          )}

          {loading && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 flex flex-col items-center justify-center space-y-8 min-h-[400px]">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin"></div>
                <Globe className="w-10 h-10 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-bold text-xl text-slate-800 mb-2">Analyzing WIPO & EUIPO Data</p>
                <div className="flex items-center justify-center space-x-2 text-slate-500">
                  <Activity className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">Grounding results in official registry domains...</span>
                </div>
              </div>
            </div>
          )}

          {recommendation && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
              {/* Viability Card */}
              <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-start gap-6 ${
                recommendation.viability === 'High' ? 'bg-green-50 border-green-100' :
                recommendation.viability === 'Medium' ? 'bg-orange-50 border-orange-100' :
                'bg-red-50 border-red-100'
              }`}>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  recommendation.viability === 'High' ? 'bg-white text-green-600' :
                  recommendation.viability === 'Medium' ? 'bg-white text-orange-600' :
                  'bg-white text-red-600'
                }`}>
                  {recommendation.viability === 'High' ? <CheckCircle2 className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">Overall Score</span>
                    <h3 className="text-2xl font-black text-slate-900">
                      Registration Viability: {recommendation.viability}
                    </h3>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">{recommendation.reasoning}</p>
                </div>
              </div>

              {/* Classification */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  International Nice Classes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendation.suggestedClasses.map((cls, idx) => (
                    <div key={idx} className="flex items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="bg-blue-600 text-white text-xs font-black w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mr-4 shadow-sm">
                        {cls.classNumber}
                      </div>
                      <p className="text-slate-600 text-sm leading-tight">{cls.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* WIPO/EUIPO Grounding Results */}
              {searchContext && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Globe className="w-32 h-32" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-blue-500" />
                    Registry Conflict Report
                  </h3>
                  <div className="prose prose-slate prose-sm max-w-none text-slate-600 mb-8 leading-relaxed whitespace-pre-wrap">
                    {searchContext.text}
                  </div>
                  
                  {searchContext.sources.length > 0 && (
                    <div className="bg-slate-50 -mx-8 -mb-8 p-8 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Official Registry Sources</p>
                      <div className="flex flex-wrap gap-3">
                        {searchContext.sources.map((chunk: any, i: number) => (
                          chunk.web && (
                            <a 
                              key={i} 
                              href={chunk.web.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-blue-600 text-xs font-bold hover:border-blue-400 hover:shadow-sm transition-all"
                            >
                              <span className="truncate max-w-[200px]">{chunk.web.title || 'Official Database Entry'}</span>
                              <ExternalLink className="w-3 h-3 ml-2" />
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Next Steps */}
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative">
                <div className="absolute top-4 right-8 px-3 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Priority Steps</div>
                <h3 className="text-xl font-bold mb-6">Strategy & Filing Roadmap</h3>
                <div className="space-y-4">
                  {recommendation.nextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                      <div className="mt-1 bg-blue-500 rounded-lg p-1 text-white">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-slate-300 text-sm font-medium">{step}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-8 bg-white text-slate-900 py-4 rounded-2xl font-black hover:bg-slate-100 transition-colors shadow-xl">
                  Proceed to Filing Center
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrademarkSearchTool;
