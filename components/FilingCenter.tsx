
import React, { useState, useRef } from 'react';
import { FileText, Upload, Trash2, Loader2, CheckCircle2, AlertCircle, Eye, FileDigit, ImageIcon, Sparkles } from 'lucide-react';
import { analyzeDocument } from '../services/gemini';
import { UploadedFile } from '../types';

const FilingCenter: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Explicitly type uploadedFiles as File[] to prevent 'unknown' property errors (name, type, size)
    const uploadedFiles = Array.from(e.target.files || []) as File[];
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: UploadedFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          status: 'pending'
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) setSelectedFile(null);
  };

  const handleAnalyze = async (file: UploadedFile) => {
    setAnalyzingId(file.id);
    try {
      const result = await analyzeDocument(file.data, file.type, file.name);
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'analyzed', analysis: result } : f
      ));
      if (selectedFile?.id === file.id) {
         setSelectedFile({ ...file, status: 'analyzed', analysis: result });
      }
    } catch (err) {
      console.error(err);
      alert("Analysis failed.");
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Filing Center</h1>
        <p className="text-slate-500">Securely upload and manage brand assets, legal documents, and evidence of use.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 pb-8">
        {/* Upload Section */}
        <div className="lg:col-span-5 flex flex-col space-y-4 h-full">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white hover:border-blue-400 transition-all cursor-pointer group"
          >
            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-700">Drop files here or browse</p>
              <p className="text-sm text-slate-400 mt-1">PDF, PNG, JPG (Max 20MB)</p>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleUpload} multiple className="hidden" accept=".pdf,image/*" />
          </div>

          <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Document Queue</span>
              <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{files.length} Files</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {files.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <FileText className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-xs">Queue is empty</p>
                </div>
              )}
              {files.map(file => (
                <div 
                  key={file.id} 
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                    selectedFile?.id === file.id ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      {file.type.includes('pdf') ? <FileDigit className="w-5 h-5 text-red-500" /> : <ImageIcon className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-slate-700 truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {file.status === 'analyzed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : analyzingId === file.id ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleAnalyze(file); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Analyze Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview / Analysis Section */}
        <div className="lg:col-span-7 flex flex-col h-full">
          {!selectedFile ? (
            <div className="h-full bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-16 h-16 mb-4 opacity-10" />
              <p className="font-medium">Select a file to view analysis</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    {selectedFile.type.includes('pdf') ? <FileDigit className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{selectedFile.name}</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{selectedFile.type}</p>
                  </div>
                </div>
                {selectedFile.status !== 'analyzed' && (
                  <button 
                    disabled={analyzingId === selectedFile.id}
                    onClick={() => handleAnalyze(selectedFile)}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                  >
                    {analyzingId === selectedFile.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>AI Analysis</span>
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                {selectedFile.analysis ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full w-fit">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Automated Document Intelligence</span>
                    </div>
                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedFile.analysis}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                    <div className="p-6 bg-slate-50 rounded-full border border-slate-100">
                      <AlertCircle className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="max-w-xs text-center text-sm">
                      This document has not been analyzed yet. Run AI Analysis to extract legal insights.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilingCenter;
