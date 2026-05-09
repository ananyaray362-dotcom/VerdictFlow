import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { action, caseName, department, deadline, officerName } = await req.json();

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a senior legal drafting officer in the Government of India. Draft a formal, official legal compliance notice for the following overdue action.

DETAILS:
- Case/Judgment: ${caseName || 'Untitled Case'}
- Required Action: ${action}
- Responsible Department/Entity: ${department || 'Concerned Department'}
- Original Deadline: ${deadline || 'Expired'}
- Issuing Officer: ${officerName || 'Compliance Officer'}

Draft a formal NOTICE TO SHOW CAUSE for non-compliance. The notice must:
1. Be written in formal legal language suitable for a Government of India official communication
2. Reference the specific court order / compliance action
3. State the consequences of continued non-compliance (contempt of court)
4. Set a new 15-day deadline for compliance
5. Be structured with: SUBJECT, REFERENCE, BACKGROUND, DIRECTION, CONSEQUENCE, TIMELINE, SIGNATURE

Write only the notice text. Do not add any preamble or explanation outside the notice itself.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 900,
    });

    const notice = completion.choices[0]?.message?.content || 'Notice could not be generated.';

    return NextResponse.json({ notice });
  } catch (error: any) {
    console.error('Notice drafting error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
