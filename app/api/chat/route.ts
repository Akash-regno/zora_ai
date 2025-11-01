import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);
    
    if (response.ok) {
      return response;
    }
    
    if (response.status === 429 && i < maxRetries - 1) {
      // Rate limit hit - wait before retrying
      const waitTime = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
      console.log(`Rate limited. Waiting ${waitTime}ms before retry ${i + 1}/${maxRetries - 1}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }
    
    return response;
  }
  
  throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

    if (geminiApiKey) {
      const response = await fetchWithRetry(
        'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${geminiApiKey}`,
          },
          body: JSON.stringify({
            model: 'gemini-2.0-flash',
            messages: messages,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      return NextResponse.json({ response: data.choices[0].message.content });
    } else if (perplexityApiKey) {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${perplexityApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Perplexity API error: ${response.statusText}`);
      }

      const data = await response.json();
      return NextResponse.json({ response: data.choices[0].message.content });
    } else {
      const lastUserMessage = messages[messages.length - 1]?.content || '';
      const mockResponse = `This is a mock response to: "${lastUserMessage}". To enable real AI responses, add your GEMINI_API_KEY or PERPLEXITY_API_KEY to the .env file.`;
      return NextResponse.json({ response: mockResponse });
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
