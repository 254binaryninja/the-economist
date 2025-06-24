import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";


/**
 * Helper function to generate a random greeting based on time of day or something random to the user in a new chat page
 * @return {string} A greeting message
 */

const model = createGoogleGenerativeAI({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY
    })('gemini-2.0-flash', { useSearchGrounding: true });

export async function generateGreeting(username: string) {
    try {
        const prompt = `Create a ${Math.random() > 0.5 ? 'professional' : 'funny'} economics-themed greeting for ${username}, max 4 words, referencing current economic trends.`;
        const response = await generateText({
            model: model,
            prompt: `${prompt} Only reply with the greeting, nothing else.`,
            maxTokens: 20,
        });
        const greeting = response.text.trim();
        return greeting;
    } catch (error) {
        console.log(error)
    }
};