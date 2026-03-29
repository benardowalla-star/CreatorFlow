import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateVideoIdeas(niche: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 creative YouTube video ideas for a channel in the ${niche} niche. 
    Return the response as a JSON array of objects with 'title' and 'description' fields.`,
    config: {
      responseMimeType: "application/json",
    }
  });

  const response = await model;
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}

export async function refineVideoDetails(title: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `For a YouTube video titled "${title}", suggest a compelling description and 5 relevant tags.
    Return as JSON with 'description' and 'tags' (array of strings).`,
    config: {
      responseMimeType: "application/json",
    }
  });

  const response = await model;
  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return { description: '', tags: [] };
  }
}

export async function getTrendingTopics(niche: string) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `What are the currently trending topics, news, or challenges in the ${niche} YouTube niche? 
    Provide 5 specific trending topics with a brief explanation of why they are trending.
    Return as a JSON array of objects with 'topic' and 'reason' fields.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
    }
  });

  const response = await model;
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse trending topics", e);
    return [];
  }
}
