import { GoogleGenAI, Type } from "@google/genai";
import { AIPlanResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateBreakdown = async (goal: string): Promise<AIPlanResponse | null> => {
  if (!apiKey) {
    console.warn("API Key is missing. AI features will not work.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Actúa como un coach de productividad experto. Tengo el siguiente objetivo a largo plazo: "${goal}". 
      Por favor, divídelo en 3 a 5 objetivos diarios pequeños y accionables que pueda empezar hoy mismo. 
      Además, dame una frase corta motivadora.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de objetivos diarios sugeridos"
            },
            motivation: {
              type: Type.STRING,
              description: "Una frase motivadora corta"
            }
          },
          required: ["tasks", "motivation"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIPlanResponse;
  } catch (error) {
    console.error("Error generating breakdown:", error);
    return null;
  }
};