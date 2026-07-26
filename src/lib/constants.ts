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
  `You are an expert ATS (Applicant Tracking System) resume reviewer and hiring manager.
Analyze the attached resume image against the job target.

TARGET POSITION:
- Job Title: ${jobTitle}
- Job Description: ${jobDescription}

SCORING INSTRUCTIONS (IMPORTANT):
- EVERY score must be an integer on a 0 to 100 percentage scale (e.g., 85, 92, 78). DO NOT output single-digit scores out of 10!
- Evaluate match quality fairly based on skills, experience, projects, keywords, and formatting.
- Well-structured resumes with matching tech stack and projects should score between 75 and 95.

Return ONLY a valid JSON object with no markdown syntax wrapping matching this exact structure:
${AIResponseFormat}
Provide 3-4 specific, actionable tips per section.`;

export const MISTRAL_KEY_LS = 'resumind_mistral_key';
