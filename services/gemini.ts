
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TrademarkSearch, FilingRecommendation, Jurisdiction } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTrademarkViability = async (search: TrademarkSearch): Promise<FilingRecommendation> => {
  const ai = getAI();
  const prompt = `
    Analyze the trademark viability for:
    Name: ${search.name}
    Industry: ${search.industry}
    Jurisdictions: ${search.jurisdictions.join(', ')}

    In your analysis, specifically consider:
    1. EUIPO (European Union Intellectual Property Office) regulations and potential EUTM conflicts.
    2. WIPO (World Intellectual Property Organization) International registrations under the Madrid System.
    3. USPTO (United States Patent and Trademark Office) likelihood of confusion rules.

    Please provide:
    1. A viability score (High, Medium, Low).
    2. Detailed reasoning considering common trademark law principles (distinctiveness, descriptiveness, likelihood of confusion).
    3. Suggested Nice Classifications (International Classification of Goods and Services).
    4. Recommended next steps for filing in ${search.jurisdictions[0]}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          viability: { type: Type.STRING, description: 'High, Medium, or Low' },
          reasoning: { type: Type.STRING },
          suggestedClasses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                classNumber: { type: Type.INTEGER },
                description: { type: Type.STRING }
              }
            }
          },
          nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['viability', 'reasoning', 'suggestedClasses', 'nextSteps']
      }
    }
  });

  return JSON.parse(response.text);
};

export const searchConflicts = async (name: string) => {
  const ai = getAI();
  // Targeting the three major global registries
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Search the WIPO Global Brand Database (wipo.int), the EUIPO TMview database (euipo.europa.eu), and the USPTO TESS database for existing trademark registrations or applications for the name "${name}". 
    Identify any potential conflicts, including identical marks or phonetically similar marks in related Nice classes. 
    Summarize the findings and list specific registration numbers if found.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const analyzeLogo = async (base64Image: string) => {
  const ai = getAI();
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64Image.split(',')[1],
    },
  };
  const textPart = {
    text: "Analyze this logo for trademark distinctiveness. Is it overly generic? Are there similar famous logos it might be confused with? Describe its visual elements in detail for a trademark filing description."
  };

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [imagePart, textPart] },
  });

  return response.text;
};

export const analyzeDocument = async (base64Data: string, mimeType: string, fileName: string) => {
  const ai = getAI();
  const part = {
    inlineData: {
      mimeType: mimeType.includes('pdf') ? 'application/pdf' : 'image/jpeg',
      data: base64Data.split(',')[1],
    },
  };
  
  const textPart = {
    text: `Analyze this document titled "${fileName}" in the context of a trademark or design filing. Summarize key legal points, identify potential issues, and extract any entity names or dates mentioned.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [part, textPart] },
  });

  return response.text;
};

export const chatAssistant = async (history: { role: 'user' | 'model', parts: { text: string }[] }[], message: string) => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are MarkGuard AI, an expert international trademark and design consultant. Provide helpful, accurate, and professional advice. Always clarify that you are an AI and not a substitute for legal counsel.'
    }
  });
  
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const generateDMCANotice = async (data: {
  infringingUrl: string;
  originalWorkDescription: string;
  name: string;
  email: string;
  address: string;
}) => {
  const ai = getAI();
  const prompt = `
    Generate a formal DMCA Takedown Notice for the following details:
    Infringing Content URL: ${data.infringingUrl}
    Original Work Description: ${data.originalWorkDescription}
    Sender Name: ${data.name}
    Sender Email: ${data.email}
    Sender Address: ${data.address}

    Notice must include identification of copyrighted work, identification of infringing material, contact info, good faith statement, and accuracy statement.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text;
};

export const analyzeInfringement = async (originalImageBase64: string, infringingImageBase64: string) => {
  const ai = getAI();
  const originalPart = {
    inlineData: {
      mimeType: 'image/png',
      data: originalImageBase64.split(',')[1],
    },
  };
  const infringingPart = {
    inlineData: {
      mimeType: 'image/png',
      data: infringingImageBase64.split(',')[1],
    },
  };
  
  const textPart = {
    text: "Compare these two images for potential trademark or copyright infringement. Analyze 'likelihood of confusion' and 'substantial similarity'."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [originalPart, infringingPart, textPart] }
  });

  return response.text;
};
