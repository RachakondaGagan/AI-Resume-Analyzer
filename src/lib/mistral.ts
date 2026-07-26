import { prepareInstructions } from './constants';

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

  try {
    const cleaned = raw.replace(/```json?\s*|\s*```/g, '').trim();
    return JSON.parse(cleaned) as Feedback;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as Feedback;
    }
    throw new Error(`Failed to parse AI response as JSON. Raw output: ${raw.slice(0, 100)}...`);
  }
}
