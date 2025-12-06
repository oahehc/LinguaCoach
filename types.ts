export interface AnalysisResult {
  transcription: string;
  correctedText: string;
  explanation: string;
  betterAlternatives: string[];
  naturalnessScore: number;
  grammarIssues: string[];
  pronunciationFeedback?: string; // Optional, mainly for audio inputs
}

export type MessageType = 'user' | 'assistant';
export type InputMode = 'text' | 'audio';

export interface Message {
  id: string;
  type: MessageType;
  inputMode: InputMode;
  content?: string; // For user text or simple messages
  audioUrl?: string; // For user audio playback
  analysis?: AnalysisResult; // For assistant responses
  timestamp: number;
  isError?: boolean;
}
