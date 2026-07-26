import { prepareInstructions } from './constants';

function normalizeScore(val: number): number {
  if (typeof val !== 'number' || isNaN(val)) return 75;
  if (val > 0 && val <= 10) return Math.min(100, Math.round(val * 10));
  return Math.min(100, Math.max(0, Math.round(val)));
}

function processFeedback(fb: Feedback): Feedback {
  if (!fb) return fb;
  fb.overallScore = normalizeScore(fb.overallScore);
  if (fb.ATS) fb.ATS.score = normalizeScore(fb.ATS.score);
  if (fb.toneAndStyle) fb.toneAndStyle.score = normalizeScore(fb.toneAndStyle.score);
  if (fb.content) fb.content.score = normalizeScore(fb.content.score);
  if (fb.structure) fb.structure.score = normalizeScore(fb.structure.score);
  if (fb.skills) fb.skills.score = normalizeScore(fb.skills.score);
  return fb;
}

export async function analyzeResume({
  imageBase64,
  jobTitle,
  jobDescription,
  apiKey,
}: {
  imageBase64: string;
  jobTitle: string;
  jobDescription: string;
  apiKey: string;
}): Promise<Feedback> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'pixtral-12b-2409',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: `data:image/png;base64,${imageBase64}` },
            { type: 'text', text: prepareInstructions({ jobTitle, jobDescription }) },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const txt = await response.text();
    let detail = txt;
    try {
      const parsed = JSON.parse(txt);
      if (parsed.message) detail = parsed.message;
    } catch {}
    throw new Error(`Mistral API Error (${response.status}): ${detail}`);
  }

  const data = await response.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';

  let parsed: Feedback;
  try {
    const cleaned = raw.replace(/```json?\s*|\s*```/g, '').trim();
    parsed = JSON.parse(cleaned) as Feedback;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]) as Feedback;
    } else {
      throw new Error(`Failed to parse AI response as JSON. Raw output: ${raw.slice(0, 100)}...`);
    }
  }

  return processFeedback(parsed);
}
