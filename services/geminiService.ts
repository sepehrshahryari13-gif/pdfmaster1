import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:application/pdf;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzePdf = async (
  file: File, 
  prompt: string, 
  history: { role: 'user' | 'model'; text: string }[] = []
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash'; // Good for document understanding
    
    // Prepare history for context if needed, but for simple QA with file, we just send file + prompt
    // For a real chat with history + file, we can structure it differently. 
    // Here we treat each request as a fresh analysis with the file attached, 
    // plus a concatenated transcript of history for context if needed.
    
    const filePart = await fileToGenerativePart(file);
    
    let fullPrompt = prompt;
    if (history.length > 0) {
      fullPrompt = `Previous conversation context:\n${history.map(h => `${h.role}: ${h.text}`).join('\n')}\n\nCurrent User Question: ${prompt}`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
            filePart,
            { text: fullPrompt }
        ]
      },
      config: {
        systemInstruction: "You are a helpful PDF AI assistant. Analyze the attached PDF document to answer the user's questions. Be concise and accurate.",
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze PDF");
  }
};
