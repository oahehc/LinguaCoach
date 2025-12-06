import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string>; // Returns base64 string
  cancelRecording: () => void;
  audioBlob: Blob | null;
}

export const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Prefer standard codecs
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder) {
        return reject("No media recorder instance");
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        setAudioBlob(blob);
        setIsRecording(false);
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop());

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String);
        };
        reader.onerror = (error) => {
          reject(error);
        };
      };

      mediaRecorder.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current;
    if (mediaRecorder) {
      // Stop all tracks to release microphone
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      // Stop recorder if it's still active
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    }
    
    // Reset state without processing data
    setIsRecording(false);
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    cancelRecording,
    audioBlob,
  };
};