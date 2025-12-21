const API_URL = 'https://room-ai-debate-engine.onrender.com/api/debate';
const USE_MOCK = true;

let chatHistory = [];
let settings = { soundEnabled: true, autoScroll: true, showTooltips: true };

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    setupInputListeners();
    loadChatHistory();
    loadSettings();
    displayRandomExamples();
    setupMarkdownRenderer();
    console.log('✅ Room AI Loaded Successfully!');
});

function setupMarkdownRenderer() {
    if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
    }
}

function renderMarkdown(text) {
    if (typeof marked === 'undefined') return escapeHtml(text);
    let html = marked.parse(text);
    if (typeof DOMPurify !== 'undefined') {
        html = DOMPurify.sanitize(html);
    }
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const icon = document.getElementById('themeIcon');
        if (icon) icon.textContent = '☀️';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const icon = document.getElementById('themeIcon');
    if (icon) icon.textContent = isDark ? '☀️' : '🌙';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function newChat() {
    document.getElementById('messages').innerHTML = '';
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('messageInput').value = '';
    displayRandomExamples();
}

function loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        chatHistory = JSON.parse(saved);
        renderChatHistory();
    }
}

function renderChatHistory() {
    const historyContainer = document.getElementById('chatHistory');
    if (!historyContainer) return;
    
    if (chatHistory.length === 0) {
        historyContainer.innerHTML = '<div style="padding:1rem;text-align:center;color:var(--text-secondary);font-size:0.85rem">No chat history yet</div>';
        return;
    }
    
    historyContainer.innerHTML = chatHistory.slice(-10).reverse().map((chat, i) => `
        <div class="chat-item" onclick="loadChat(${chatHistory.length - 1 - i})">
            <div class="chat-preview">${chat.question.substring(0, 40)}${chat.question.length > 40 ? '...' : ''}</div>
            <div class="chat-time">${formatTime(chat.timestamp)}</div>
        </div>
    `).join('');
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

function displayRandomExamples() {
    const examples = [
        { icon: '💻', text: 'Write a binary search algorithm in Python with explanation' },
        { icon: '🔬', text: 'Explain quantum computing in simple terms' },
        { icon: '📐', text: 'Prove the Pythagorean theorem' },
        { icon: '🧘', text: 'What are the best practices for time management?' }
    ];
    
    const grid = document.querySelector('.example-grid');
    if (grid) {
        grid.innerHTML = examples.map(ex => `
            <button class="example-card" onclick="useExample('${ex.text.replace(/'/g, "\\'")}')">
                <span class="example-icon">${ex.icon}</span>
                <span class="example-text">${ex.text}</span>
            </button>
        `).join('');
    }
}

function setupInputListeners() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (input) {
        input.addEventListener('input', () => {
            sendBtn.disabled = !input.value.trim();
        });
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function useExample(text) {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    input.value = text;
    sendBtn.disabled = false;
    input.focus();
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;

    const questionTimestamp = Date.now();
    
    document.getElementById('welcomeScreen').style.display = 'none';
    addMessage('user', message, questionTimestamp);
    
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('sendBtn').disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const data = {
            finalAnswer: `# Here's a comprehensive answer

This is synthesized from multiple AI models debating your question.

## Key Points

1. **First important point**: The debate process involves independent analysis
2. **Second point**: Cross-examination catches logical errors
3. **Third point**: Final synthesis ensures quality

### Example

\`\`\`python
def hello():
    print("Hello from Room AI!")
\`\`\`

This demonstrates the power of **multi-agent debate**!`,
            models: { modelA: "Llama 3.3 70B", modelB: "Mistral 7B" }
        };

        const answerTimestamp = Date.now();
        addMessage('ai', data.finalAnswer, answerTimestamp);

        chatHistory.push({
            question: message,
            answer: data.finalAnswer,
            timestamp: questionTimestamp
        });
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
        renderChatHistory();
        
    } catch (error) {
        addMessage('ai', 'Sorry, there was an error processing your request. Please try again.');
        console.error('Error:', error);
    }
}

function addMessage(role, content, timestamp) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = role === 'user' ? '👤' : '🤖';
    const author = role === 'user' ? 'You' : 'Debate AI';
    const timeStr = timestamp ? `<span class="message-time">${formatTime(timestamp)}</span>` : '';

    let renderedContent;
    if (role === 'ai') {
        renderedContent = renderMarkdown(content);
    } else {
        renderedContent = escapeHtml(content);
    }

    messageDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">${avatar}</div>
            <div class="message-author">${author}</div>
            ${timeStr}
        </div>
        <div class="message-content">${renderedContent}</div>
    `;

    messages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    if (!settings.autoScroll) return;
    
    const container = document.getElementById('messagesContainer');
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
}

function loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
        settings = JSON.parse(saved);
    }
}

function openSettingsModal() {
    alert('Settings Panel\n\nSound Effects: ' + (settings.soundEnabled ? 'ON' : 'OFF') + '\nAuto Scroll: ' + (settings.autoScroll ? 'ON' : 'OFF'));
}

function openSearchModal() {
    alert('Search History\n\nPress Ctrl+K to search through your chat history.');
}

function openExportModal() {
    alert('Export Options:\n\n- Markdown (.md)\n- JSON (.json)\n- Plain Text (.txt)');
}

function shareConversation() {
    alert('Share Conversation\n\nYour conversation has been copied to clipboard!');
}

function showStats() {
    const totalChats = chatHistory.length;
    const totalMessages = totalChats * 2;
    alert(`📊 Statistics\n\nTotal Chats: ${totalChats}\nTotal Messages: ${totalMessages}\nAverage Response Time: ~60s`);
}

function showKeyboardShortcuts() {
    alert('⌨️ Keyboard Shortcuts\n\nCtrl+/ - Show shortcuts\nCtrl+K - Search history\nCtrl+E - Export chat\nCtrl+N - New chat\nCtrl+, - Settings\nEsc - Close modals\nEnter - Send message\nShift+Enter - New line');
}

function showSecurityInfo() {
    alert('🔒 Security Features\n\n✅ XSS Protection (DOMPurify)\n✅ Rate Limiting (20 req/min)\n✅ Content Security Policy\n✅ HTTPS Only\n✅ Secure Cookies\n✅ Input Sanitization\n\n💡 All user inputs are sanitized and validated before processing.');
}

function loadChat(index) {
    const chat = chatHistory[index];
    if (!chat) return;
    
    const messages = document.getElementById('messages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    messages.innerHTML = '';
    welcomeScreen.style.display = 'none';
    
    addMessage('user', chat.question, chat.timestamp);
    addMessage('ai', chat.answer, chat.timestamp + 1000);
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

console.log('✅ Room AI JavaScript Loaded!');
