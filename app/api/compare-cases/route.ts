import { NextRequest, NextResponse } from 'next/server';
import { callGroqMessages } from '@/lib/groq/client';

export async function POST(req: NextRequest) {
  const { case1, case2 } = await req.json();

  const prompt = `You are a legal analyst. Compare these two court judgments and identify:
1. Contradictions or conflicts between their directives
2. Overlapping compliance requirements
3. Recommendation on which takes precedence

CASE 1: ${case1.title}
Directives: ${case1.keyDirectives?.join('; ')}
Compliance Actions: ${case1.complianceActions?.map((a: any) => a.action).join('; ')}

CASE 2: ${case2.title}
Directives: ${case2.keyDirectives?.join('; ')}
Compliance Actions: ${case2.complianceActions?.map((a: any) => a.action).join('; ')}

Respond as JSON: { "contradictions": [...], "overlaps": [...], "recommendation": "..." }`;

  try {
    const text = await callGroqMessages([{ role: 'user', content: prompt }], 800, 0.1);
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const result = JSON.parse(cleaned);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}