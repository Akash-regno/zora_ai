# AI Code Solver Chat Website

A clean, modern chat interface for solving coding problems using Groq AI.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your Groq API key:
```
GROQ_API_KEY=your_groq_api_key_here
PORT=3000
```

3. Start the server:
```bash
npm start
```

4. Open your browser to `http://localhost:3000`

## Features

- Clean chat interface
- Code syntax highlighting
- Markdown support
- Conversation history
- Example prompts to get started

## Tech Stack

- Backend: Node.js + Express
- Frontend: Vanilla JavaScript
- AI: Groq API (Llama 3.3 70B)

## Deployment

### Deploy to Render, Railway, or similar platforms:

1. Push your code to GitHub (make sure `.env` is not committed)
2. Connect your repository to the platform
3. Set environment variable: `GROQ_API_KEY=your_actual_key`
4. The platform will automatically use `PORT` from environment
5. Deploy!

### Deploy to Vercel:
- Note: Vercel is optimized for serverless. Consider using Render or Railway for this Express app.

### Important:
- Never commit your `.env` file with real API keys
- Set `GROQ_API_KEY` as an environment variable in your deployment platform
- The app will use `process.env.PORT` which most platforms provide automatically
