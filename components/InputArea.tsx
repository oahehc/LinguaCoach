import React, { useState } from 'react';
import { Mic, Square, Loader2, X } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface InputAreaProps {
  onSendAudio: (base64Audio: string) => void;
  disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendAudio, disabled }) => {
  const { isRecording, startRecording, stopRecording, cancelRecording } = useAudioRecorder();
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const handleMicClick = async () => {
    if (disabled || isProcessingAudio) return;

    if (isRecording) {
      setIsProcessingAudio(true);
      try {
        const base64Audio = await stopRecording();
        onSendAudio(base64Audio);
      } catch (err) {
        console.error("Failed to stop recording:", err);
      } finally {
        setIsProcessingAudio(false);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 p-6 sticky bottom-0 z-10 flex flex-col items-center gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      
      {/* Button Container */}
      <div className="relative flex items-center justify-center">
        
        {/* Cancel Button - Positioned to the left */}
        {isRecording && (
          <div className="absolute right-[100%] mr-6 animate-in fade-in zoom-in duration-200">
            <button
              onClick={cancelRecording}
              className="p-4 rounded-full bg-white text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all duration-200 shadow-sm group"
              title="Cancel recording"
              aria-label="Cancel recording"
            >
              <X size={24} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}

        {/* Main Mic/Stop Button */}
        <button
          onClick={handleMicClick}
          disabled={disabled && !isRecording}
          className={`shrink-0 p-6 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform active:scale-95 ${
            isRecording 
              ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse ring-4 ring-red-100' 
              : isProcessingAudio 
                ? 'bg-slate-200 text-slate-500' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 ring-4 ring-indigo-100 hover:scale-105'
          }`}
        >
          {isProcessingAudio ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isRecording ? (
            <Square size={32} fill="currentColor" />
          ) : (
            <Mic size={32} />
          )}
        </button>
      </div>
      
      {/* Helper text */}
      <p className={`text-sm font-medium transition-colors duration-300 ${isRecording ? 'text-red-500' : 'text-slate-400'}`}>
        {isRecording 
          ? "Listening... Tap square to finish." 
          : isProcessingAudio
            ? "Processing audio..."
            : "Tap the microphone to speak"}
      </p>
    </div>
  );
};

export default InputArea;