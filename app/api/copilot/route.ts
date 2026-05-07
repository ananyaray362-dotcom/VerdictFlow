import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { callGroqMessages } from '@/lib/groq/client';

export async function POST(req: NextRequest) {
  const { question } = await req.json();
  const supabase = createClient();

  // Fetch summary context from DB
  const { data: cases } = await supabase
    .from('cases')
    .select('case_number, title, status, priority, department, summary')
    .limit(20);

  const { data: actions } = await supabase
    .from('compliance_actions')
    .select('action, status, deadline, priority, responsible_department')
    .neq('status', 'completed')
    .limit(30);

  const context = `
Current cases in system:
${JSON.stringify(cases?.slice(0, 10), null, 2)}

Pending compliance actions:
${JSON.stringify(actions?.slice(0, 15), null, 2)}`;

  const messages = [
    { role: 'system', content: `You are VerdictFlow AI Co-Pilot for Indian government legal compliance officers. Answer questions using the provided case data. Be concise, helpful, and cite case numbers when relevant.\n\nCASE DATA:\n${context}` },
    { role: 'user', content: question }
  ];

  try {
    const answer = await callGroqMessages(messages, 600, 0.2);
    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}