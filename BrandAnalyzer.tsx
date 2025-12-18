
import React, { useState, useRef, useEffect } from 'react';
import { Upload, ImageIcon, Loader2, Sparkles, Wand2, Camera, RefreshCw, Check } from 'lucide-react';
import { analyzeLogo } from '../services/gemini';

const BrandAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setIsCameraActive(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setAnalysis(null);
      setImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have given permission.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const result = await analyzeLogo(image);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      alert('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Design & Logo Analyzer</h1>
          <p className="text-slate-500">Check your visual brand identity for legal distinctiveness and potential conflicts.</p>
        </div>
        <div className="flex space-x-2">
           <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Upload File</span>
          </button>
          <button 
            onClick={isCameraActive ? stopCamera : startCamera}
            className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-colors shadow-sm ${
              isCameraActive 
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">{isCameraActive ? 'Cancel Camera' : 'Use Camera'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className={`relative aspect-square rounded-3xl border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-all ${
              image || isCameraActive ? 'border-blue-300 bg-blue-50/20' : 'border-slate-300 bg-white'
            }`}>
            
            {/* Camera View */}
            {isCameraActive && !image && (
              <div className="absolute inset-0 w-full h-full bg-black flex flex-col items-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 flex space-x-4">
                  <button 
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-slate-900"></div>
                  </button>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {image && !isCameraActive && (
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <img src={image} alt="Logo" className="max-h-full max-w-full object-contain" />
                <button 
                  onClick={() => { setImage(null); setAnalysis(null); }}
                  className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur rounded-full shadow hover:bg-white transition-colors text-slate-500"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Empty State */}
            {!image && !isCameraActive && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-8 cursor-pointer w-full h-full flex flex-col items-center justify-center"
              >
                <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                  <ImageIcon className="w-10 h-10 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-600">No brand mark selected</p>
                <p className="text-sm text-slate-400 mt-1">Upload a file or use your camera</p>
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!image || loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
            <span>{loading ? 'Analyzing Vision...' : 'Analyze Visual Brand'}</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 min-h-[400px]">
          {!analysis && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
              <ImageIcon className="w-16 h-16 mb-4 opacity-10" />
              <p>Capture or upload a logo and click analyze to see AI insights</p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                <Wand2 className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="font-medium text-slate-600">Extracting visual characteristics...</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center space-x-2 mb-6 text-blue-600">
                <Sparkles className="w-5 h-5" />
                <span className="font-bold uppercase tracking-widest text-xs">AI Vision Intelligence</span>
              </div>
              <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700 leading-relaxed">
                {analysis}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium italic">* Analysis based on visual distinctiveness and common trademark rules.</span>
                <button 
                  className="flex items-center space-x-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  onClick={() => window.print()}
                >
                  <Check className="w-4 h-4" />
                  <span>Save Report</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandAnalyzer;
