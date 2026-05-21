require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Validate API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'GROQ_API_KEY is not configured. Please set it in your environment variables.' });
    }

    const messages = [
      {
        role: 'system',
        content: 'You are an expert programming assistant. Help users solve coding problems, debug code, explain concepts, and provide clear solutions with code examples.'
      },
      ...history,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    // Check if response is ok before parsing
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Groq API error';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      console.error('Groq API Error:', errorMessage);
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from Groq API');
    }

    res.json({
      message: data.choices[0].message.content,
      role: 'assistant'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred' });
  }
});

app.post('/api/perplexity', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!process.env.PERPLEXITY_API_KEY) {
      return res.status(500).json({ error: 'PERPLEXITY_API_KEY is not configured. Please set it in your environment variables.' });
    }

    const messageContent = `You are an expert programming assistant. Help users solve coding problems, debug code, explain concepts, and provide clear solutions with code examples.\n\nUser: ${message}`;

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

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Perplexity API error';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `API Error (${response.status}): ${errorText.substring(0, 200)}`;
      }
      
      console.error('Perplexity API Error:', errorMessage);
      return res.status(response.status).json({ error: errorMessage });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from Perplexity API');
    }

    res.json({
      message: data.choices[0].message.content,
      role: 'assistant'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred' });
  }
});

app.post('/api/gemini', async (req, res) => {
  try {
    const { message, history = [], image } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured. Please set it in your environment variables.' });
    }

    const contents = [];
    
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
    
    contents.push({
      role: 'user',
      parts: currentMessageParts
    });

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

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Gemini API error';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = `API Error (${response.status}): ${errorText.substring(0, 200)}`;
      }
      
      console.error('Gemini API Error:', errorMessage);
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
    
    if (!fullResponse) {
      throw new Error('No response text received from Gemini API');
    }

    res.json({
      message: fullResponse,
      role: 'assistant'
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
