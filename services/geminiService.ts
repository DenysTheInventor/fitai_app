
import { GoogleGenAI } from "@google/genai";
import type { DailyLog, UserSettings, CheckIn } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getAiAnalysis = async (
  logs: DailyLog[],
  userSettings: UserSettings,
  checkIns: CheckIn[],
  periodDescription: string
): Promise<string> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    Analyze the user's fitness and wellness data for ${periodDescription}.
    
    User Profile:
    - Name: ${userSettings.name}
    - Weight: ${userSettings.weight} kg
    - Height: ${userSettings.height} cm
    - Goal: "${userSettings.goal}"

    Here is the data for the period:
    Daily Logs:
    ${JSON.stringify(logs, null, 2)}

    Weekly Check-ins (if any):
    ${JSON.stringify(checkIns, null, 2)}

    Please provide a concise, encouraging, and actionable analysis based on this data. Structure your response in Markdown.
    Include the following sections, using these exact titles:
    - **Overall Summary:** A brief overview of the user's consistency and progress.
    - **Workout Performance:** Insights on their workouts. Are they progressing? Any suggestions?
    - **Nutrition Insights:** Comments on their diet based on the provided logs.
    - **Sleep & Habits:** Observations about their sleep patterns and habit consistency.
    - **Actionable Recommendations:** 2-3 specific, simple tips for the user to focus on next.

    Be positive and motivational. Address the user by their name, ${userSettings.name}.
    Keep the analysis easy to read and digest. Use bullet points for lists.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return "There was an issue with the API configuration. Please check if the API key is correct.";
        }
    }
    throw new Error("Failed to get analysis from AI. Please try again later.");
  }
};
