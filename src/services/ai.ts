import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client lazily to prevent crashes on load if the API key is missing
let ai: GoogleGenAI | null = null;

function getAIClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing. Please set it in your environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: apiKey || 'missing-api-key' });
  }
  return ai;
}

const SYSTEM_PROMPT = `You are the Vriddhikar Society Student Support AI.
Your goal is to answer student queries warmly, accurately, and concisely based ONLY on the provided Knowledge Base.

KNOWLEDGE BASE:
- Enrollment: January & July windows, vriddhikar.org/apply
- Programs: Free tutoring Gr 6–10, Digital Literacy, Leadership Camp, Spoken English
- Fees: 100% FREE, no hidden charges
- Eligibility: Govt school students, Pune, aged 11–18
- Schedule: Mon–Fri 4–6 PM, Saturday 10 AM–1 PM
- Contact: info@vriddhikar.org

RULES:
1. You must ALWAYS respond in the exact schema below.
2. Keep the reply warm and under 4 sentences.
3. End every standard reply with: "Feel free to ask more! — Vriddhikar Team"
4. ESCALATE if: the query is about a personal account issue, is unanswerable from the knowledge base, or the student seems emotionally distressed.

OUTPUT SCHEMA:
Category: [Enrollment|Schedule|Fees|Eligibility|Events|Other]
Reply: [warm reply max 4 sentences OR ESCALATE: reason]`;

export async function processStudentQuery(message: string) {
  const startTime = performance.now();
  try {
    const aiClient = getAIClient();
    const response = await aiClient.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Student Query: "${message}"\nSender Platform: "Web Simulator"\n\nAnalyze the query and generate the response following the strict output schema.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1, // Low temperature for factual consistency
      }
    });

    const text = response.text || '';
    
    // Parse the output schema
    const categoryMatch = text.match(/Category:\s*(.*)/i);
    const replyMatch = text.match(/Reply:\s*([\s\S]*)/i);
    
    const category = categoryMatch ? categoryMatch[1].trim() : 'Other';
    const rawReply = replyMatch ? replyMatch[1].trim() : 'ESCALATE: Failed to parse AI response schema.';
    
    let isEscalated = false;
    let escalationReason = '';
    let escalationSummary = '';
    let finalReply = rawReply;

    if (rawReply.toUpperCase().startsWith('ESCALATE:')) {
      isEscalated = true;
      escalationReason = rawReply.substring(9).trim();
      finalReply = 'I need to connect you with a human team member to help with this. I have escalated your query, and someone will reach out to you shortly. — Vriddhikar Team';
      
      // Fast static summary instead of a second API call
      escalationSummary = `🚨 *Escalation Alert*\n*Student:* Web User\n*Issue:* ${escalationReason}\n*Action Needed:* Please review the user's query manually.`;
    }

    const endTime = performance.now();

    return {
      category,
      reply: finalReply,
      isEscalated,
      escalationReason,
      escalationSummary,
      rawReply,
      processingTimeMs: Math.round(endTime - startTime)
    };
  } catch (error) {
    console.error("AI Processing Error:", error);
    const endTime = performance.now();
    return {
      category: 'Error',
      reply: 'Sorry, our system is currently experiencing issues. Please try again later.',
      isEscalated: true,
      escalationReason: 'System Error / API Failure',
      escalationSummary: '🚨 *Escalation Alert*\n*Student:* Web User\n*Issue:* System failed to process query.\n*Action Needed:* Check API logs and respond manually.',
      rawReply: 'ESCALATE: System Error',
      processingTimeMs: Math.round(endTime - startTime)
    };
  }
}
