module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ error: 'PERPLEXITY_API_KEY is not configured. Please set it in Vercel environment variables.' });
    }

    // Build messages array - Perplexity format (only user message, no history for simplicity)
    const messageContent = `You are an expert programming assistant. Help users solve coding problems, debug code, explain concepts, and provide clear solutions with code examples.\n\nUser: ${message}`;

    console.log('Calling Perplexity API...');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: messageContent
        }],
        temperature: 0.2,
        max_tokens: 16000
      })
    });

    console.log('Perplexity response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Error Response:', errorText);
      
      let errorMessage = 'Perplexity API error';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `API Error (${response.status}): ${errorText.substring(0, 200)}`;
      }
      
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    console.log('Perplexity response received');
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid response structure:', JSON.stringify(data));
      throw new Error('Invalid response structure from Perplexity API');
    }

    return res.status(200).json({
      message: data.choices[0].message.content,
      role: 'assistant'
    });

  } catch (error) {
    console.error('Error in Perplexity handler:', error);
    return res.status(500).json({ error: error.message || 'An unexpected error occurred' });
  }
};
