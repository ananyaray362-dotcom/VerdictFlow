import { NextRequest, NextResponse } from 'next/server';
import { callGroqMessages } from '@/lib/groq/client';

export async function POST(req: NextRequest) {
  const { caseTitle, courtName, judgmentDate, summary, complianceActions, department } = await req.json();

  const prompt = `Draft a formal official government reply memo to the ${courtName} regarding:

Case: ${caseTitle}
Judgment Date: ${judgmentDate}
Summary: ${summary}
Department: ${department}
Compliance Actions to be taken:
${complianceActions.map((a: any, i: number) => `${i+1}. ${a.action} (Deadline: ${a.deadline || 'TBD'})`).join('\n')}

Write a formal, professional government memo (To the Registrar, Subject, Body with specific compliance commitments, From the Officer). Use Indian government memo format. Include specific dates and department names. Keep it under 400 words.`;

  try {
    const memo = await callGroqMessages([{ role: 'user', content: prompt }], 600, 0.2);
    return NextResponse.json({ memo });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}