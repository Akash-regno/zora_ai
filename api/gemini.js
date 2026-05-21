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
    const { message, history = [], image } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured. Please set it in environment variables.' });
    }

    // Build messages for Gemini format
    const contents = [];
    
    // Add history
    history.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });
    
    // Build current message with optional image
    const currentMessageParts = [];
    
    if (image && image.data) {
      currentMessageParts.push({
        inline_data: {
          mime_type: image.mimeType,
          data: image.data
        }
      });
    }
    
    currentMessageParts.push({ text: message });
    
    // Add current message
    contents.push({
      role: 'user',
      parts: currentMessageParts
    });

    console.log('Calling Gemini API...');

    const apiKey = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${encodeURIComponent(apiKey)}&alt=sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });

    console.log('Gemini response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error Response:', errorText);
      
      let errorMessage = 'Gemini API error';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `API Error (${response.status}): ${errorText.substring(0, 200)}`;
      }
      
      return res.status(response.status).json({ error: errorMessage });
    }

    // Parse SSE stream from response body
    const text = await response.text();
    const lines = text.split('\n');
    let fullResponse = '';
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const jsonData = JSON.parse(line.slice(6));
          if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
            fullResponse += jsonData.candidates[0].content.parts[0].text;
          }
        } catch (e) {
          // Skip invalid JSON lines
        }
      }
    }
    
    console.log('Gemini response received');
    
    if (!fullResponse) {
      throw new Error('No response text received from Gemini API');
    }

    return res.status(200).json({
      message: fullResponse,
      role: 'assistant'
    });

  } catch (error) {
    console.error('Error in Gemini handler:', error);
    return res.status(500).json({ error: error.message || 'An unexpected error occurred' });
  }
};
