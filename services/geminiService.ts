import { GoogleGenAI } from "@google/genai";
import type { DailyLog, UserSettings, CheckIn } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function formatDataForPrompt(logs: DailyLog[], settings: UserSettings, checkIns: CheckIn[]): string {
    let formattedString = "Here is the user's profile and their data:\n\n";

    // Add user profile information
    formattedString += "--- User Profile ---\n";
    formattedString += `Name: ${settings.name}\n`;
    if (settings.age) formattedString += `Age: ${settings.age}\n`;
    if (settings.gender) formattedString += `Gender: ${settings.gender}\n`;
    if (settings.weight) formattedString += `Weight: ${settings.weight} kg\n`;
    if (settings.height) formattedString += `Height: ${settings.height} cm\n`;
    if (settings.goal) {
        const goalMap = { 'lose': 'Lose Weight', 'maintain': 'Maintain Weight', 'gain': 'Gain Muscle' };
        formattedString += `Primary Goal: ${goalMap[settings.goal]}\n`;
    }
    if (settings.bio) formattedString += `Bio: ${settings.bio}\n`;
    formattedString += "\n";

    if (logs.length === 0 && checkIns.length === 0) {
        return formattedString + "No activity or check-in data available.";
    }

    // Add the full history of check-ins to show trends over time
    if (checkIns.length > 0) {
        formattedString += "--- Body Measurement History (All Check-ins) ---\n";
        const sortedCheckIns = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        sortedCheckIns.forEach(ci => {
            formattedString += `Date: ${ci.date} -> Weight: ${ci.weight}kg, Waist: ${ci.waist}cm, Chest: ${ci.chest}cm\n`;
        });
        formattedString += "\n";
    }
    
    // Add activity logs for the selected period
    if (logs.length > 0) {
        formattedString += "--- Activity Logs (for the selected period) ---\n";
        const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
                        formattedString += `- ${workout.name}: ${workout.steps} steps\n`;
                    } else if (workout.type === 'Sport') {
                        formattedString += `- ${workout.name}: ${workout.durationMinutes} minutes\n`;
                    } else if (workout.type === 'OutdoorRun') {
                         formattedString += `- ${workout.name}: ${workout.distanceKm.toFixed(2)} km in ${Math.round(workout.durationSeconds / 60)} minutes\n`;
                    }
                });
            } else {
                formattedString += "Workouts: No workout logged.\n";
            }
            formattedString += "\n";
        });
    } else {
         formattedString += "--- Activity Logs ---\nNo activity logged for the selected period.\n";
    }


    return formattedString;
}

export const getAiAnalysis = async (logs: DailyLog[], settings: UserSettings, checkIns: CheckIn[], periodDescription: string): Promise<string> => {
    const dataPrompt = formatDataForPrompt(logs, settings, checkIns);
    const fullPrompt = `
        Ты — экспертный тренер по фитнесу и питанию по имени FitAI.
        Пользователь запросил анализ своих данных за следующий период: **${periodDescription}**.
        
        Проанализируй следующие данные пользователя. Они включают: личный профиль, полную историю измерений тела и журналы активности за указанный период.

        ${dataPrompt}

        Основываясь на всей этой информации (профиль, цель и зарегистрированные данные), предоставь четкий, структурированный анализ. Ответ ДОЛЖЕН быть на русском языке в следующем формате с использованием markdown:

        **Прогресс и композиция тела**
        *   Проанализируй тенденции веса и измерений на основе данных чек-инов (если они доступны).
        *   Прокомментируй, как изменения в композиции тела соотносятся с питанием, тренировками и общей целью.

        **Анализ питания**
        *   Проанализируй потребление калорий и макронутриентов в соответствии с целью пользователя.
        *   Прокомментируй, достаточно ли он ест или слишком много.
        *   Дай конкретные советы по улучшению диеты.

        **Анализ тренировочной нагрузки**
        *   Проанализируй частоту, объем и тип тренировок.
        *   Дай конкретные советы по тренировочной нагрузке, предложив корректировки при необходимости (например, больший объем, больше отдыха, другие виды упражнений).
        *   Прокомментируй сон и восстановление, если данные доступны.

        **Комментарии тренера**
        *   Предоставь любые другие важные комментарии или мотивационные идеи, которые ты считаешь необходимыми. Это может быть о последовательности, потенциальных рисках или поощрении.
        
        Сохраняй позитивный, проницательный и максимально персонализированный тон.
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