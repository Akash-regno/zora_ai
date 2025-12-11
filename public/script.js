let conversationHistory = [];
let chatSessions = [];
let currentSessionId = null;

// Lock screen functionality
let isUnlocked = false;

marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

// Check if site was previously unlocked
window.addEventListener('DOMContentLoaded', () => {
  const unlocked = localStorage.getItem('siteUnlocked');
  if (unlocked === 'true') {
    unlockSite();
  } else {
    showLockScreen();
  }
});

// Listen for Ctrl+Shift+. keyboard shortcut (toggle lock/unlock)
document.addEventListener('keydown', (e) => {
  // Check for Ctrl+Shift+. (period) - on Windows it might be '>' or '.'
  if (e.ctrlKey && e.shiftKey && (e.key === '.' || e.key === '>' || e.code === 'Period')) {
    e.preventDefault();
    
    if (isUnlocked) {
      lockSite();
    } else {
      unlockSite();
      showUnlockSuccess();
    }
  }
});

function showLockScreen() {
  document.getElementById('lockScreen').style.display = 'flex';
}

function unlockSite() {
  isUnlocked = true;
  localStorage.setItem('siteUnlocked', 'true');
  
  const lockScreen = document.getElementById('lockScreen');
  lockScreen.style.display = 'none';
}

function lockSite() {
  isUnlocked = false;
  localStorage.setItem('siteUnlocked', 'false');
  
  const lockScreen = document.getElementById('lockScreen');
  lockScreen.style.display = 'flex';
}

function showUnlockSuccess() {
  // Just unlock without showing success message (keeping the fake error page look)
}

// Debug: Show what keys are being pressed (remove after testing)
document.addEventListener('keydown', (e) => {
  if (!isUnlocked) {
    console.log('Key pressed:', {
      key: e.key,
      code: e.code,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey
    });
  }
});

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

function newChat() {
  // Save current chat if it has messages
  if (conversationHistory.length > 0) {
    const firstMessage = conversationHistory[0]?.content || 'New Chat';
    chatSessions.push({
      id: Date.now(),
      title: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      history: [...conversationHistory]
    });
    updateChatHistory();
  }

  // Reset conversation
  conversationHistory = [];
  currentSessionId = null;
  
  // Clear chat container and show welcome message
  const chatContainer = document.getElementById('chatContainer');
  chatContainer.innerHTML = `
    <div class="welcome-message">
      <div class="welcome-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2>Hello, Developer!</h2>
      <p>I'm LolliBot, your AI coding assistant. What can I help you build today?</p>
      <div class="examples">
        <button class="example-btn shortcut-btn" onclick="insertShortcut('Provide only the code: ')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
          Code Only
        </button>
        <button class="example-btn shortcut-btn" onclick="insertShortcut('Provide the code in C++ only: ')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
          C++ Code
        </button>
        <button class="example-btn shortcut-btn" onclick="insertShortcut('Provide the code in C only: ')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
          C Code
        </button>
        <button class="example-btn shortcut-btn" onclick="insertShortcut('Explanation only: ')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          </svg>
          Explain Only
        </button>
      </div>
    </div>
  `;
}

function updateChatHistory() {
  const historyContainer = document.getElementById('chatHistory');
  historyContainer.innerHTML = '<div class="history-item active"><span>Current Chat</span></div>';
  
  chatSessions.forEach(session => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.textContent = session.title;
    item.onclick = () => loadChat(session.id);
    historyContainer.appendChild(item);
  });
}

function loadChat(sessionId) {
  const session = chatSessions.find(s => s.id === sessionId);
  if (!session) return;

  currentSessionId = sessionId;
  conversationHistory = [...session.history];
  
  const chatContainer = document.getElementById('chatContainer');
  chatContainer.innerHTML = '';
  
  // Rebuild chat from history
  for (let i = 0; i < conversationHistory.length; i++) {
    const msg = conversationHistory[i];
    addMessage(msg.content, msg.role);
  }
  
  toggleSidebar();
}

function sendExample(text) {
  document.getElementById('userInput').value = text;
  sendMessage();
}

function insertShortcut(text) {
  const input = document.getElementById('userInput');
  input.value = text;
  input.focus();
  // Position cursor at the end
  input.setSelectionRange(text.length, text.length);
}

async function sendMessage() {
  const input = document.getElementById('userInput');
  const message = input.value.trim();
  
  if (!message) return;

  const chatContainer = document.getElementById('chatContainer');
  const sendBtn = document.getElementById('sendBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');

  // Remove welcome message if exists
  const welcomeMsg = chatContainer.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }

  // Add user message
  addMessage(message, 'user');
  input.value = '';
  input.style.height = 'auto';

  // Show typing indicator
  showTypingIndicator();

  // Disable send button
  sendBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        history: conversationHistory
      })
    });

    // Check if response has content before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
    }

    const text = await response.text();
    if (!text) {
      throw new Error('Server returned empty response. Please check if GROQ_API_KEY is set in Vercel environment variables.');
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get response');
    }

    // Remove typing indicator
    removeTypingIndicator();

    // Add assistant message
    addMessage(data.message, 'assistant');

    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: data.message }
    );

    // Keep only last 10 messages to avoid token limits
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

  } catch (error) {
    removeTypingIndicator();
    addMessage(`Error: ${error.message}`, 'error');
  } finally {
    sendBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

function showTypingIndicator() {
  const chatContainer = document.getElementById('chatContainer');
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message assistant-message typing-indicator-message';
  typingDiv.id = 'typingIndicator';

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar assistant-avatar';
  avatarDiv.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    </svg>
  `;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content typing-indicator';
  contentDiv.innerHTML = `
    <div class="typing-dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
    <span class="typing-text">LolliBot is thinking...</span>
  `;

  typingDiv.appendChild(avatarDiv);
  typingDiv.appendChild(contentDiv);
  chatContainer.appendChild(typingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
  const typingIndicator = document.getElementById('typingIndicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

function addMessage(content, role) {
  const chatContainer = document.getElementById('chatContainer');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}-message`;

  const avatarDiv = document.createElement('div');
  avatarDiv.className = `message-avatar ${role}-avatar`;
  
  if (role === 'user') {
    avatarDiv.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    `;
  } else if (role === 'assistant') {
    avatarDiv.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
    `;
  } else {
    avatarDiv.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    `;
  }

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  if (role === 'assistant') {
    contentDiv.innerHTML = marked.parse(content);
    
    // Add copy buttons to code blocks
    setTimeout(() => {
      const codeBlocks = contentDiv.querySelectorAll('pre code');
      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement;
        if (!pre.querySelector('.copy-btn')) {
          const copyBtn = document.createElement('button');
          copyBtn.className = 'copy-btn';
          copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            <span>Copy</span>
          `;
          copyBtn.onclick = () => copyCode(codeBlock, copyBtn);
          pre.style.position = 'relative';
          pre.appendChild(copyBtn);
        }
      });
    }, 0);
  } else {
    contentDiv.textContent = content;
  }

  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function copyCode(codeBlock, button) {
  const code = codeBlock.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const originalHTML = button.innerHTML;
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
      </svg>
      <span>Copied!</span>
    `;
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('copied');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

// Send message on Enter (Shift+Enter for new line)
document.getElementById('userInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
document.getElementById('userInput').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});
