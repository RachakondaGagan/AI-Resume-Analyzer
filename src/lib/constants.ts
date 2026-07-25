export const AIResponseFormat = `{
  "overallScore": number,
  "ATS": {
    "score": number,
    "tips": [{ "type": "good" | "improve", "tip": string }]
  },
  "toneAndStyle": {
    "score": number,
    "tips": [{ "type": "good" | "improve", "tip": string, "explanation": string }]
  },
  "content": {
    "score": number,
    "tips": [{ "type": "good" | "improve", "tip": string, "explanation": string }]
  },
  "structure": {
    "score": number,
    "tips": [{ "type": "good" | "improve", "tip": string, "explanation": string }]
  },
  "skills": {
    "score": number,
    "tips": [{ "type": "good" | "improve", "tip": string, "explanation": string }]
  }
}`;

export const prepareInstructions = ({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) =>
  `You are an expert ATS and resume analyst.
Analyze the resume image carefully and rate it.
Give honest, detailed feedback. Low scores are fine if warranted.
Job title: ${jobTitle}
Job description: ${jobDescription}
Return ONLY a valid JSON object matching this exact shape (no markdown, no backticks):
${AIResponseFormat}
Give 3-4 tips per section. ATS tips only need "type" and "tip". All other sections also need "explanation".`;

export const MISTRAL_KEY_LS = 'resumind_mistral_key';
