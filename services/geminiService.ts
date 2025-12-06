import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transcription: {
      type: Type.STRING,
      description: "The transcription of the user's input. If text input, just repeat it. If audio, transcribe exactly what was said.",
    },
    correctedText: {
      type: Type.STRING,
      description: "The grammatically correct version of the sentence.",
    },
    explanation: {
      type: Type.STRING,
      description: "A friendly, concise explanation of the grammar or vocabulary errors found.",
    },
    betterAlternatives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 2-3 more natural or native-sounding ways to say the same thing.",
    },
    naturalnessScore: {
      type: Type.INTEGER,
      description: "A score from 1 to 100 rating how natural the sentence sounds.",
    },
    grammarIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific grammar mistakes identified.",
    },
    pronunciationFeedback: {
      type: Type.STRING,
      description: "If audio is provided, give feedback on pronunciation clarity. If text only, leave empty.",
    },
  },
  required: ["transcription", "correctedText", "explanation", "betterAlternatives", "naturalnessScore", "grammarIssues"],
};

export const analyzeInput = async (
  input: string,
  mode: 'text' | 'audio'
): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash"; // Fast and capable multimodal model

  const systemInstruction = `You are an expert, encouraging English language coach. 
  Your goal is to help the user improve their English skills.
  Analyze the user's input (text or audio).
  If the input is audio, transcribe it carefully first.
  Identify grammar mistakes, awkward phrasing, or vocabulary misuse.
  Provide a corrected version that retains the user's original meaning but improves accuracy and flow.
  Give a friendly explanation of why the correction was made.
  Suggest alternative ways to say it that sound more like a native speaker.
  Rate the naturalness on a scale of 1-100.
  If the input is Audio, strictly evaluate pronunciation if possible, otherwise note if it was clear.`;

  try {
    let contents;

    if (mode === 'audio') {
      // Input is base64 audio string (without data URI prefix ideally, but Gemini SDK handles some formats, better to strip)
      // Expecting input to be raw base64 data here.
      const base64Data = input.includes('base64,') ? input.split('base64,')[1] : input;
      
      contents = {
        parts: [
          {
            inlineData: {
              mimeType: "audio/webm", // Assuming webm from browser MediaRecorder
              data: base64Data,
            },
          },
          {
            text: "Please analyze my English speech.",
          },
        ],
      };
    } else {
      contents = {
        parts: [{ text: input }],
      };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
