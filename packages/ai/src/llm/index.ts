export interface LLMConfig {
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  tokensUsed: number;
}

export async function callLLM(
  config: LLMConfig,
  messages: LLMMessage[]
): Promise<LLMResponse> {
  const response = await fetch(`${config.baseUrl || 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 500,
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens ?? 0,
  };
}
