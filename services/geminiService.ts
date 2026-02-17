import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are NetGuardian AI, an expert Tier 3 Network Engineer assistant. 
Your goal is to assist network administrators with troubleshooting, configuration generation, log analysis, and security auditing.

Capabilities:
1. Analyze network logs and identify root causes (e.g., OSPF flap, spanning tree loops, firewall drops).
2. Generate configuration snippets for Cisco IOS, Juniper Junos, Mikrotik RouterOS, and Linux networking.
3. Explain complex networking concepts (BGP, MPLS, VXLAN) simply.
4. Provide security recommendations based on input data.

Format your responses using Markdown. Be concise, professional, and technically accurate.
If you provide code/config, use code blocks.
`;

export const sendMessageToGemini = async (
  history: ChatMessage[], 
  newMessage: string,
  networkContext?: string
): Promise<string> => {
  if (!apiKey) {
    return "Error: API_KEY is missing. Please set it in your environment variables.";
  }

  // Inject real-time network state into the system instruction for this turn
  const dynamicSystemInstruction = networkContext 
    ? `${SYSTEM_INSTRUCTION}\n\n=== LIVE NETWORK STATE (READ-ONLY) ===\n${networkContext}\n\n[INSTRUCTION]: Use the provided LIVE NETWORK STATE to answer user queries about specific devices, status, alerts, or performance. If the user asks for a summary, analyze this data.`
    : SYSTEM_INSTRUCTION;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.3, // Lower temperature for more factual analysis of the context
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage({
        message: newMessage
    });
    
    return result.text || "No response received from the network assistant.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Unable to reach the AI Network Assistant. Please check your connection or API key.";
  }
};

export const auditConfiguration = async (configData: string): Promise<string> => {
  if (!apiKey) return "Error: API Key missing.";
  
  try {
    const model = ai.models;
    const prompt = `
      Act as a Security Auditor. Review the following network device configuration.
      Identify:
      1. Security vulnerabilities (e.g., telnet enabled, weak passwords, missing ACLs).
      2. Configuration errors or best practice violations.
      3. Suggestions for optimization.

      Configuration:
      \`\`\`
      ${configData}
      \`\`\`

      Provide a summary checklist and then detailed findings.
    `;

    const result = await model.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are a strict Network Security Auditor.",
      }
    });

    return result.text || "No audit results generated.";
  } catch (error) {
    console.error("Audit Error:", error);
    return "Failed to perform AI Audit.";
  }
};