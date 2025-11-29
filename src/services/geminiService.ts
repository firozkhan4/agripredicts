import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getAgriculturalInsight = async (question: string, contextData: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `
      You are an expert agricultural consultant. 
      Use the following statistical context about a farming dataset to answer the user's question.
      Context: ${contextData}
      
      User Question: ${question}
      
      Keep your answer concise, practical, and farmer-friendly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate an insight at this time.";
  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return "Sorry, I am unable to connect to the AI service at the moment. Please check your API key.";
  }
};
