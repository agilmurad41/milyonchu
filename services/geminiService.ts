
import { GoogleGenAI } from "@google/genai";

// Function to generate a hint for the question
export const getAIHint = async (question: string, options: string[]): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "API Key tapılmadı.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Updated prompt for direct Answer
    const prompt = `
      Sən "Bilməcə Live" oyununda köməkçi "Bilgə İnsan"san.
      
      Sual: "${question}"
      Variantlar:
      A) ${options[0]}
      B) ${options[1]}
      C) ${options[2]}
      D) ${options[3]}
      
      Zəhmət olmasa, sualın düzgün cavabını BİRBAŞA de (Məsələn: "Düzgün cavab A variantıdır: [Cavabın mətni]").
      Daha sonra cavabın niyə düzgün olduğunu qısa və maraqlı şəkildə izah et.
      Cavab Azərbaycan dilində olmalıdır.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Üzr istəyirəm, hal-hazırda cavabı tapa bilmirəm.";
  } catch (error) {
    console.error("Gemini API Error (Hint):", error);
    return "Bağışlayın, əlaqə problemi yarandı.";
  }
};

export const generateQuestionImage = async (questionText: string): Promise<string | null> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("No API Key found for image generation");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imagePrompt = `A high quality, cinematic, artistic illustration representing the following trivia question concept: "${questionText}". No text in the image. 4k resolution, detailed.`;

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: imagePrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    
    if (base64ImageBytes) {
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    
    return null;
  } catch (error) {
    console.error("Gemini API Error (Image):", error);
    return null;
  }
};
