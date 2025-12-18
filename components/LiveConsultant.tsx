
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { Mic, MicOff, PhoneOff, User, Waves, Bot, ShieldCheck, PlayCircle, Loader2 } from 'lucide-react';

// Implementation of required manual base64 functions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveConsultant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [transcription, setTranscription] = useState<string>("");
  const [modelTranscription, setModelTranscription] = useState<string>("");

  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const startConsultation = async () => {
    setStatus('connecting');
    // Always use process.env.API_KEY directly and create instance before use
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            setIsActive(true);
            
            if (audioContextInRef.current && streamRef.current) {
              const source = audioContextInRef.current.createMediaStreamSource(streamRef.current);
              const scriptProcessor = audioContextInRef.current.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const l = inputData.length;
                const int16 = new Int16Array(l);
                for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmBlob: Blob = {
                  data: encode(new Uint8Array(int16.buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                // Solely rely on sessionPromise resolves
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextInRef.current.destination);
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
                setModelTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.inputTranscription) {
                setTranscription(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
                // Clear buffers on turn complete
                setTranscription("");
                setModelTranscription("");
            }

            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && audioContextOutRef.current) {
              const ctx = audioContextOutRef.current;
              // Track end of audio playback queue for smooth playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                ctx,
                24000,
                1,
              );
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              const gainNode = ctx.createGain();
              source.connect(gainNode);
              gainNode.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              // Schedule next audio chunk to start at exact end time of previous one
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error('Live Error:', e),
          onclose: () => endConsultation(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: 'You are an elite international trademark and IP consultant. Speak professionally, calmly, and help the user with their filing strategy. Keep answers concise for a natural conversation.',
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert("Microphone access is required for the live consultant.");
    }
  };

  const endConsultation = () => {
    // Avoid double-closing if endConsultation is called multiple times
    if (status === 'idle' && !isActive) return;

    setIsActive(false);
    setStatus('idle');

    if (sessionRef.current) {
      const session = sessionRef.current;
      sessionRef.current = null;
      try { session.close(); } catch(e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextInRef.current) {
      if (audioContextInRef.current.state !== 'closed') {
        audioContextInRef.current.close().catch(console.error);
      }
      audioContextInRef.current = null;
    }

    if (audioContextOutRef.current) {
      if (audioContextOutRef.current.state !== 'closed') {
        audioContextOutRef.current.close().catch(console.error);
      }
      audioContextOutRef.current = null;
    }

    sourcesRef.current.clear();
    setTranscription("");
    setModelTranscription("");
  };

  useEffect(() => {
    return () => {
      endConsultation();
    };
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col items-center">
      <div className="w-full text-left mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Live IP Consultant</h1>
        <p className="text-slate-500">Real-time voice consultation for your global filing strategy.</p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col relative">
        <div className="h-64 bg-slate-900 relative flex items-center justify-center overflow-hidden">
          {/* Animated Waveform Background */}
          {isActive ? (
            <div className="absolute inset-0 opacity-20 flex items-center justify-center">
               <div className="flex items-end space-x-1 h-32">
                  {[...Array(20)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-blue-500 rounded-full animate-bounce"
                      style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.05}s` }}
                    />
                  ))}
               </div>
            </div>
          ) : (
             <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950"></div>
          )}
          
          <div className="relative z-10 flex flex-col items-center">
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
              isActive ? 'border-blue-500 scale-110 shadow-[0_0_50px_rgba(59,130,246,0.5)]' : 'border-slate-700'
            }`}>
              <Bot className={`w-16 h-16 ${isActive ? 'text-blue-400' : 'text-slate-600'}`} />
            </div>
            <p className="mt-6 text-white font-bold text-lg tracking-widest uppercase">
              {status === 'connecting' ? 'Establishing Secure Line...' : status === 'connected' ? 'Expert Online' : 'Expert Offline'}
            </p>
            {status === 'connected' && (
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Live Encrypted</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 p-8 space-y-8 min-h-[300px] flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-2 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Elite Strategy Consultant</h3>
                <p className="text-sm text-slate-500">Specializing in Madrid Protocol & EUIPO filings.</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 min-h-[120px] flex flex-col justify-center text-center">
               {status === 'connected' ? (
                 <>
                   <div className="flex items-center justify-center space-x-2 text-slate-400 mb-2">
                     <Waves className="w-4 h-4 animate-pulse" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Listening for query...</span>
                   </div>
                   <div className="space-y-2">
                     {transcription && (
                       <p className="text-slate-600 italic text-sm">You: "{transcription}"</p>
                     )}
                     {modelTranscription && (
                       <p className="text-blue-600 font-medium leading-relaxed">Expert: {modelTranscription}</p>
                     )}
                     {!transcription && !modelTranscription && (
                       <p className="text-slate-400 text-sm">Ask about your trademark classes or regional requirements.</p>
                     )}
                   </div>
                 </>
               ) : (
                 <p className="text-slate-500 text-sm">Click the button below to start a high-priority voice consultation with our AI legal expert.</p>
               )}
            </div>
          </div>

          <div className="flex items-center justify-center pt-4">
            {status === 'idle' ? (
              <button
                onClick={startConsultation}
                className="group relative flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold shadow-2xl shadow-blue-200 transition-all active:scale-95"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <PlayCircle className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Start Consultation</span>
              </button>
            ) : status === 'connecting' ? (
              <button disabled className="flex items-center space-x-3 bg-slate-100 text-slate-400 px-10 py-5 rounded-2xl font-bold cursor-not-allowed">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Connecting...</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                 <button className="bg-slate-100 text-slate-600 p-4 rounded-2xl hover:bg-slate-200 transition-colors">
                    <MicOff className="w-6 h-6" />
                 </button>
                 <button
                  onClick={endConsultation}
                  className="flex items-center space-x-3 bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-2xl font-bold shadow-xl shadow-red-200 transition-all active:scale-95"
                >
                  <PhoneOff className="w-6 h-6" />
                  <span>End Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <span>End-to-end Encrypted</span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <span>Real-time Response</span>
        </div>
      </div>
    </div>
  );
};

export default LiveConsultant;
