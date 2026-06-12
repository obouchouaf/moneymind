import OpenAI from 'openai';

const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function getAIResponse(
  messages: ChatMessage[],
  userContext: string
): Promise<string> {
  const systemPrompt = `You are WealthPilot AI, a personal finance coach. You are helpful, concise, and data-driven.
You have access to the user's financial data:
${userContext}

Always give specific, actionable advice based on the user's actual data. Be encouraging but honest.
Keep responses concise (2-4 sentences unless a detailed plan is requested). Use emojis sparingly.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || 'I apologize, I could not generate a response. Please try again.';
}

export async function generateFinancialInsight(userContext: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a financial advisor. Generate a single, specific, actionable financial insight based on the user data. Keep it under 2 sentences. Be encouraging.',
      },
      {
        role: 'user',
        content: `Generate a personalized financial insight for this user: ${userContext}`,
      },
    ],
    max_tokens: 150,
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content || 'Keep tracking your expenses to gain better financial insights!';
}

export async function generateSavingsplan(
  goalName: string,
  targetAmount: number,
  currentAmount: number,
  monthlyContribution: number,
  monthlyIncome: number
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Create a brief 3-step savings plan for: Goal="${goalName}", Target=$${targetAmount}, Current=$${currentAmount}, Monthly contribution=$${monthlyContribution}, Monthly income=$${monthlyIncome}. Be specific and motivating.`,
      },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || 'Stay consistent with your monthly contributions to reach your goal!';
}

export async function generateBudgetRecommendations(
  income: number,
  expenses: Record<string, number>,
  currency: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Based on income ${currency}${income} and expenses: ${JSON.stringify(expenses)}, give 2-3 specific budget recommendations. Be concise.`,
      },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || 'Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.';
}
