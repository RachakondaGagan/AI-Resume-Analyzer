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
      model: 'mistral-small-latest',
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
    let errorDetail = txt;
    try {
      const errObj = JSON.parse(txt);
      if (errObj.error?.message) errorDetail = errObj.error.message;
      else if (errObj.message) errorDetail = errObj.message;
    } catch {}
    throw new Error(`Mistral API error (${response.status}): ${errorDetail}`);
  }

  const data = await response.json();
  const raw: string = data.choices?.[0]?.message?.content ?? '';

  try {
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(clean) as Feedback;
  } catch {
    const firstBrace = raw.indexOf('{');
    const lastBrace = raw.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = raw.substring(firstBrace, lastBrace + 1);
      return JSON.parse(jsonStr) as Feedback;
    }
    throw new Error(`Could not parse JSON response from Mistral AI: ${raw.slice(0, 100)}...`);
  }
}
