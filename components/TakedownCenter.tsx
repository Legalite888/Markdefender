
import React, { useState, useRef } from 'react';
import { ShieldAlert, FileText, Send, Loader2, Scale, AlertTriangle, CheckCircle2, Copy, Download, Upload, ImageIcon } from 'lucide-react';
import { generateDMCANotice, analyzeInfringement } from '../services/gemini';

// TypeScript error fix: Removed manual declaration of aistudio as it conflicts with existing environment types.
// The environment provides the AIStudio type for window.aistudio.

const TakedownCenter: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'notice' | 'compare'>('notice');
  const [loading, setLoading] = useState(false);
  
  // Notice Form State
  const [formData, setFormData] = useState({
    infringingUrl: '',
    originalWorkDescription: '',
    name: '',
    email: '',
    address: ''
  });
  const [generatedNotice, setGeneratedNotice] = useState<string | null>(null);

  // Compare State
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [infringingImage, setInfringingImage] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<string | null>(null);

  const originalInputRef = useRef<HTMLInputElement>(null);
  const infringingInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const notice = await generateDMCANotice(formData);
      setGeneratedNotice(notice);
    } catch (err) {
      console.error(err);
      alert("Failed to generate notice.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'infringing') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'original') setOriginalImage(reader.result as string);
        else setInfringingImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunComparison = async () => {
    if (!originalImage || !infringingImage) return;

    // MANDATORY: Check for selected API key before using gemini-3-pro-image-preview
    try {
      // Use (window as any) to safely access aistudio which is pre-configured in the environment
      if (!(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
        // Assuming success after triggering dialog as per race condition guidance
      }
    } catch (err) {
      console.warn("API key check failed, attempting to proceed:", err);
    }

    setLoading(true);
    try {
      const result = await analyzeInfringement(originalImage, infringingImage);
      setCompareResult(result);
    } catch (error: any) {
      console.error(error);
      // Reset key selection state and prompt if requested entity (key) not found
      if (error.message?.includes("Requested entity was not found.")) {
        alert("A paid project API key is required. Please select one to continue.");
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("Comparison failed. Please check your connection and API key.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedNotice) {
      navigator.clipboard.writeText(generatedNotice);
      alert("Notice copied to clipboard!");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center">
            <ShieldAlert className="w-8 h-8 mr-3 text-red-600" />
            DMCA Takedown Center
          </h1>
          <p className="text-slate-500">Enforce your intellectual property rights with AI-powered notices and infringement analysis.</p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-slate-200 flex shadow-sm">
          <button 
            onClick={() => setActiveMode('notice')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeMode === 'notice' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Notice Generator
          </button>
          <button 
            onClick={() => setActiveMode('compare')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeMode === 'compare' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Infringement Comparison
          </button>
        </div>
      </div>

      {activeMode === 'notice' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 text-red-600 mb-6">
              <FileText className="w-5 h-5" />
              <h3 className="font-bold text-lg">Case Details</h3>
            </div>
            <form onSubmit={handleSubmitNotice} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">URL of Infringing Content</label>
                <input 
                  type="url" 
                  name="infringingUrl" 
                  value={formData.infringingUrl} 
                  onChange={handleInputChange}
                  placeholder="https://example.com/stolen-content" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Original Work Description</label>
                <textarea 
                  name="originalWorkDescription" 
                  value={formData.originalWorkDescription} 
                  onChange={handleInputChange}
                  placeholder="Describe your copyrighted work in detail (e.g., product photo, logo design, text)..." 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all h-32 resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Physical Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-100 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span>Generate Legal Notice</span>
              </button>
            </form>
          </div>

          {/* Result */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Scale className="w-6 h-6 text-red-500" />
                <h3 className="font-bold text-lg">Official Notice Preview</h3>
              </div>
              {generatedNotice && (
                <div className="flex space-x-2">
                  <button onClick={copyToClipboard} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Copy text">
                    <Copy className="w-5 h-5" />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Download as PDF">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-6 overflow-y-auto font-mono text-sm leading-relaxed text-slate-300">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                  <p className="text-slate-500 italic">Drafting legally binding documents...</p>
                </div>
              ) : generatedNotice ? (
                <div className="whitespace-pre-wrap">{generatedNotice}</div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <FileText className="w-12 h-12 opacity-10" />
                  <p className="text-slate-500">Complete the form to generate a DMCA notice.</p>
                </div>
              )}
            </div>
            <div className="mt-6 flex items-start space-x-3 p-4 bg-red-950/50 border border-red-900/50 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs text-red-200">
                <p className="mb-1 font-bold">Important Notice:</p>
                <p>
                  Misrepresenting infringement in a DMCA notice can lead to legal liability. Ensure your claim is accurate and made in good faith. 
                  Users must select an API key from a paid project for this high-quality analysis tool. 
                  See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Billing Documentation</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Original */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center">
                    <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
                    1. Your Original Work
                  </h4>
                  <div 
                    onClick={() => originalInputRef.current?.click()}
                    className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all overflow-hidden"
                  >
                    {originalImage ? (
                      <img src={originalImage} className="w-full h-full object-contain" alt="Original" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm">Upload Original</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={originalInputRef} onChange={(e) => handleImageUpload(e, 'original')} className="hidden" accept="image/*" />
                </div>

                {/* Infringing */}
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    2. Alleged Infringing Content
                  </h4>
                  <div 
                    onClick={() => infringingInputRef.current?.click()}
                    className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-red-400 transition-all overflow-hidden"
                  >
                    {infringingImage ? (
                      <img src={infringingImage} className="w-full h-full object-contain" alt="Infringing" />
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm">Upload Screenshot</span>
                      </div>
                    )}
                  </div>
                  <input type="file" ref={infringingInputRef} onChange={(e) => handleImageUpload(e, 'infringing')} className="hidden" accept="image/*" />
                </div>
             </div>

             <button 
                onClick={handleRunComparison}
                disabled={!originalImage || !infringingImage || loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all disabled:opacity-50"
             >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Scale className="w-6 h-6" />}
                <span>Analyze Similarity Index</span>
             </button>
          </div>

          {compareResult && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in zoom-in-95 duration-500">
              <div className="flex items-center space-x-2 text-red-600 mb-6">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-bold text-xl uppercase tracking-wider">Expert Similarity Analysis</h3>
              </div>
              <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                {compareResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TakedownCenter;
