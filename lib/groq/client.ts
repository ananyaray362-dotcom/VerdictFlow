// Groq AI client — OpenAI-compatible /chat/completions endpoint
// Free tier: 14,400 requests/day. Get key at https://console.groq.com

const GROQ_BASE = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export async function callGroqMessages(messages: any[], max_tokens: number = 800, temperature: number = 0.1): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured. Add it to .env.local');
  }
  const response = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function callGroq(prompt: string): Promise<string> {
  return callGroqMessages([{ role: 'user', content: prompt }], undefined, 0.1);
}
