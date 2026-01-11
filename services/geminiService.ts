
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchRecipe = async (query: string, mode: 'traditional' | 'pantry' = 'traditional'): Promise<Recipe> => {
  const prompt = mode === 'traditional' 
    ? `Gere uma receita detalhada de comida nordestina baseada em: ${query}. A resposta deve estar em português do Brasil.`
    : `Crie uma receita criativa e autêntica da culinária nordestina brasileira usando EXCLUSIVAMENTE ou como base principal estes ingredientes que tenho em casa: ${query}. Você pode assumir que o usuário tem itens básicos como sal, óleo e água. A resposta deve estar em português do Brasil.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "Você é um Chef renomado especialista em culinária do Nordeste brasileiro. Suas receitas são autênticas, respeitam as tradições locais e incluem uma breve história cultural do prato. Além da receita, sugira uma lista variada de bebidas para harmonizar, incluindo sucos de frutas tropicais (caju, umbu, graviola, seriguela), refrigerantes regionais (como Guaraná Jesus), diferentes tipos de cachaças artesanais ou até café coado se for o caso.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          instructions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          history: { type: Type.STRING },
          cookingTime: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['Fácil', 'Médio', 'Difícil'] },
          drinkPairings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Sugestões variadas de bebidas para acompanhar o prato."
          }
        },
        required: ["title", "description", "ingredients", "instructions", "history", "cookingTime", "difficulty", "drinkPairings"]
      }
    }
  });

  const recipeData = JSON.parse(response.text);
  return {
    ...recipeData,
    id: Math.random().toString(36).substr(2, 9)
  };
};

export const generateFoodImage = async (foodName: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: `Uma foto profissional e apetitosa de um prato de ${foodName}, culinária nordestina brasileira, iluminação natural, close-up, apresentação em cerâmica rústica.` }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
  }
  return null;
};

export const generateRecipeAudio = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Narração da receita: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (error) {
    console.error("Erro ao gerar áudio:", error);
    return null;
  }
};

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
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
