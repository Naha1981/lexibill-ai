
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from "../constants";
import { TaskType } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini not found in environment variables. AI features will be limited.");
}
// const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null; // AI instance no longer needed for these functions

// AI-driven description enhancement and categorization are no longer used.
// The user's description is used as-is.
// TaskType will default to OTHER.

// Placeholder for any future AI utility functions if needed.
// For now, this file is largely empty as specific AI interactions for description/categorization are removed.
