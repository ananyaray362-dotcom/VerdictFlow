import { NextRequest, NextResponse } from 'next/server';
import { callGroqMessages } from '@/lib/groq/client';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { question, judgmentText, chatHistory } = await req.json();

  const systemPrompt = `You are VerdictFlow Legal Assistant, an expert in Indian court judgments.
You have been given the full text of a court judgment. Answer the officer's question using ONLY information from this judgment.
Always cite the relevant section or paragraph when answering.
If the answer is not in the judgment, say "This information is not mentioned in the judgment."

JUDGMENT TEXT:
${judgmentText?.slice(0, 12000)}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.map((m: any) => ({ role: m.role, content: m.content })),
    { role: 'user', content: question }
  ];

  try {
    const answer = await callGroqMessages(messages, 800, 0.1);
    return NextResponse.json({ answer });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
