import { GoogleGenAI } from "@google/genai";
import type { DailyLog, UserSettings } from "../types";

if (!process.env.API_KEY) {
    console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

function formatDataForPrompt(logs: DailyLog[], settings: UserSettings): string {
    let formattedString = "Here is the user's profile and their activity log data:\n\n";

    // Add user profile information
    formattedString += "--- User Profile ---\n";
    formattedString += `Name: ${settings.name}\n`;
    if (settings.age) formattedString += `Age: ${settings.age}\n`;
    if (settings.weight) formattedString += `Weight: ${settings.weight} kg\n`;
    if (settings.height) formattedString += `Height: ${settings.height} cm\n`;
    if (settings.goal) {
        const goalMap = { 'lose': 'Lose Weight', 'maintain': 'Maintain Weight', 'gain': 'Gain Muscle' };
        formattedString += `Primary Goal: ${goalMap[settings.goal]}\n`;
    }
    if (settings.bio) formattedString += `Bio: ${settings.bio}\n`;
    formattedString += "\n";
    

    if (logs.length === 0) {
        return formattedString + "No activity data available for the selected period.";
    }
    
    formattedString += "--- Activity Logs ---\n";
    const sortedLogs = [...logs].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedLogs.forEach(log => {
        formattedString += `--- Date: ${log.date} ---\n`;
        
        if (log.sleep) {
            formattedString += `Sleep: ${log.sleep.durationHours} hours\n`;
        } else {
            formattedString += "Sleep: Not logged.\n";
        }

        if (log.nutrition) {
            formattedString += `Nutrition: ${log.nutrition.calories}kcal, ${log.nutrition.protein}g P, ${log.nutrition.carbs}g C, ${log.nutrition.fats}g F, ${log.nutrition.sugar}g Sugar\n`;
        } else {
            formattedString += "Nutrition: Not logged.\n";
        }

        if (log.workouts.length > 0) {
            formattedString += "Workouts:\n";
            log.workouts.forEach(workout => {
                if (workout.type === 'WeightLifting') {
                    const sets = workout.sets.map(s => `${s.reps} reps at ${s.weight}kg`).join(', ');
                    formattedString += `- ${workout.name}: ${sets}\n`;
                } else if (workout.type === 'Cardio') {
                    formattedString += `- ${workout.name}: ${workout.durationMinutes} minutes`
                    if(workout.distanceKm){
                        formattedString += ` (${workout.distanceKm} km)\n`;
                    } else {
                        formattedString += `\n`;
                    }
                } else {
                    formattedString += `- ${workout.name}: ${workout.durationMinutes} minutes\n`;
                }
            });
        } else {
            formattedString += "Workouts: No workout logged.\n";
        }
        formattedString += "\n";
    });

    return formattedString;
}

export const getAiAnalysis = async (logs: DailyLog[], settings: UserSettings, periodDescription: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.reject("API key is not configured.");
    }
    
    const dataPrompt = formatDataForPrompt(logs, settings);
    const fullPrompt = `
        You are an expert fitness and nutrition coach named 'FitAI'.
        A user has asked for an analysis of their data for the following period: **${periodDescription}**.
        
        Analyze the following user data, which includes their personal profile and their activity logs for the specified period.

        ${dataPrompt}

        Based on all this information (their profile, goal, and logged data), provide a clear, structured analysis. The response MUST be in the following format using markdown:

        **Nutrition Review**
        *   Analyze their calorie and macronutrient intake in relation to their goal.
        *   Comment on whether they are eating enough or too much.
        *   Provide specific advice on what to improve in their diet.

        **Training Load Analysis**
        *   Analyze their workout frequency, volume, and type.
        *   Provide specific advice on their training load, suggesting adjustments if necessary (e.g., more volume, more rest, different types of exercise).
        *   Comment on their sleep and recovery, if data is available.

        **Coach's Comments**
        *   Provide any other important comments or motivational insights you think are necessary. This could be about consistency, potential risks, or encouragement.
        
        Keep the tone positive, insightful, and highly personalized.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching AI analysis:", error);
        return "There was an error analyzing your data. Please check the console for more details and ensure your API key is valid.";
    }
};
