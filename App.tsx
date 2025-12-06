import React, { useState, useRef, useEffect } from 'react';
import { analyzeInput } from './services/geminiService';
import { Message, AnalysisResult } from './types';
import AnalysisCard from './components/AnalysisCard';
import InputArea from './components/InputArea';
import { Sparkles, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendAudio = async (base64Audio: string) => {
    // Add a placeholder audio message
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      inputMode: 'audio',
      audioUrl: base64Audio, // Storing full base64 data URI for playback
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    await processInput(base64Audio, 'audio');
  };

  const processInput = async (input: string, mode: 'text' | 'audio') => {
    setIsLoading(true);
    try {
      const analysis = await analyzeInput(input, mode);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        inputMode: mode,
        analysis: analysis,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
         id: (Date.now() + 1).toString(),
         type: 'assistant',
         inputMode: 'text',
         isError: true,
         content: "Sorry, I had trouble analyzing that. Please try again.",
         timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              LinguaCoach
            </h1>
          </div>
          <div className="text-sm text-slate-500 font-medium">
             AI English Tutor
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Welcome Message */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-20 text-center space-y-4 opacity-70">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-2">
                <Sparkles size={40} />
              </div>
              <h2 className="text-2xl font-bold text-slate-700">Improve your English today</h2>
              <p className="text-slate-500 max-w-md">
                Tap the microphone button below and speak. I'll listen to your pronunciation, correct your grammar, and help you sound like a native speaker.
              </p>
            </div>
          )}

          {/* Messages List */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* Message Bubble */}
              <div className={`relative max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
                msg.type === 'user' 
                  ? 'bg-indigo-600 text-white rounded-br-none' 
                  : msg.isError 
                    ? 'bg-red-50 text-red-600 border border-red-100'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
              }`}>
                {msg.type === 'user' && msg.inputMode === 'audio' && msg.audioUrl && (
                  <div className="flex items-center gap-3">
                     <span className="text-xs uppercase tracking-wider font-bold opacity-75">Your Audio</span>
                     <audio controls src={msg.audioUrl} className="h-8 w-48 rounded opacity-90" />
                  </div>
                )}

                {msg.type === 'user' && msg.inputMode === 'text' && (
                  <p className="text-lg leading-relaxed">{msg.content}</p>
                )}

                {msg.type === 'assistant' && msg.isError && (
                  <p>{msg.content}</p>
                )}
                
                {/* For assistant responses, we show a small header inside the bubble if we want, or just the card below */}
                {msg.type === 'assistant' && msg.analysis && (
                   <div>
                      <p className="text-sm font-medium text-slate-400 mb-1">Coach's Analysis for:</p>
                      <p className="text-lg italic text-slate-800 mb-2">"{msg.analysis.transcription}"</p>
                   </div>
                )}
              </div>

              {/* Analysis Card for Assistant */}
              {msg.type === 'assistant' && msg.analysis && (
                <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <AnalysisCard analysis={msg.analysis} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start w-full">
               <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-6 py-4 shadow-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                  <span className="text-sm text-slate-500 font-medium">Analyzing your speech...</span>
               </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <InputArea 
        onSendAudio={handleSendAudio} 
        disabled={isLoading} 
      />

    </div>
  );
};

export default App;