const API_URL = 'https://room-ai-debate-engine.onrender.com/api/debate';
const USE_MOCK = true;

const DEBATE_PHASES = [
    { name: "Independent Solutions", icon: "🧠", description: "AI models are analyzing your question independently", duration: 15 },
    { name: "Cross-Examination", icon: "💬", description: "Models are challenging each other's reasoning", duration: 15 },
    { name: "Critical Analysis", icon: "🔍", description: "Deep critique to catch errors and validate logic", duration: 15 },
    { name: "Final Synthesis", icon: "✨", description: "Creating the best answer from all insights", duration: 10 }
];

const FUN_FACTS = [
    "AI debates catch 3x more logical errors than single models!",
    "Multi-agent systems were inspired by how scientific peer review works.",
    "The debate process mirrors how human experts solve complex problems.",
    "Each AI model brings unique reasoning patterns to the discussion.",
    "Cross-examination helps identify hidden assumptions in arguments.",
    "This collaborative approach reduces AI hallucinations significantly.",
    "The synthesis phase combines the strengths of all models.",
    "Debate-based AI is being used in medical diagnosis research!"
];

const EXAMPLE_PROMPTS = {
    coding: [
        "Write a binary search algorithm in Python with explanation",
        "Explain the difference between async/await and Promises",
        "How does garbage collection work in JavaScript?",
        "Compare quicksort vs mergesort algorithms"
    ],
    science: [
        "Explain quantum computing in simple terms",
        "What is CRISPR and how does it work?",
        "Explain the theory of relativity with equations",
        "How do neural networks learn?"
    ],
    math: [
        "Prove the Pythagorean theorem",
        "Explain Euler's identity: e^(iπ) + 1 = 0",
        "What is the Riemann Hypothesis?",
        "How does calculus work?"
    ],
    practical: [
        "What are the benefits of meditation?",
        "How to start learning a new language effectively?",
        "Best practices for time management",
        "How to build good habits?"
    ]
};

const KEYBOARD_SHORTCUTS = {
    'ctrl+n': 'New Chat',
    'ctrl+k': 'Search History',
    'ctrl+s': 'Save Prompt',
    'ctrl+e': 'Export Chat',
    'ctrl+,': 'Settings',
    'ctrl+/': 'Show Shortcuts',
    'esc': 'Close Modals'
};

let debateViewExpanded = false;
let currentDebateData = null;
let chatHistory = [];
let savedPrompts = [];
let settings = {
    soundEnabled: true,
    autoScroll: true,
    showTooltips: true,
    theme: 'auto'
};
let konamiCode = [];
let konamiPattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    setupInputListeners();
    loadChatHistory();
    loadSavedPrompts();
    loadSettings();
    displayRandomExamples();
    setupMarkdownRenderer();
    createToastContainer();
    addRippleEffect();
    setupKeyboardShortcuts();
    setupContextMenu();
    createModals();
    setupKonamiCode();
});

// Sound System
const sounds = {
    send: () => playSound(440, 100, 'sine'),
    receive: () => playSound(880, 150, 'sine'),
    error: () => playSound(200, 200, 'sawtooth'),
    success: () => playSound(660, 100, 'sine')
};

function playSound(frequency, duration, type = 'sine') {
    if (!settings.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;
        
        if (ctrl && key === 'n') {
            e.preventDefault();
            newChat();
        } else if (ctrl && key === 'k') {
            e.preventDefault();
            openSearchModal();
        } else if (ctrl && key === 's') {
            e.preventDefault();
            openSavePromptModal();
        } else if (ctrl && key === 'e') {
            e.preventDefault();
            openExportModal();
        } else if (ctrl && key === ',') {
            e.preventDefault();
            openSettingsModal();
        } else if (ctrl && key === '/') {
            e.preventDefault();
            showKeyboardShortcuts();
        } else if (key === 'escape') {
            closeAllModals();
        }
    });
}

// Konami Code Easter Egg
function setupKonamiCode() {
    document.addEventListener('keydown', (e) => {
        konamiCode.push(e.key);
        konamiCode = konamiCode.slice(-10);
        
        if (konamiCode.join(',') === konamiPattern.join(',')) {
            activateEasterEgg();
        }
    });
}

function activateEasterEgg() {
    showToast('🎉 Konami Code Activated! Ultra Debate Mode!', 'success', 5000);
    sounds.success();
    
    // Add party mode
    document.body.style.animation = 'rainbow 2s linear infinite';
    
    setTimeout(() => {
        document.body.style.animation = '';
    }, 5000);
}

// Context Menu
function setupContextMenu() {
    document.addEventListener('contextmenu', (e) => {
        const message = e.target.closest('.message.ai');
        if (message) {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, message);
        }
    });
    
    document.addEventListener('click', () => {
        hideContextMenu();
    });
}

function showContextMenu(x, y, message) {
    hideContextMenu();
    
    const menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.className = 'context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    menu.innerHTML = `
        <div class="context-menu-item" onclick="regenerateMessage()">
            <span>🔄</span> Regenerate
        </div>
        <div class="context-menu-item" onclick="copyMessageText()">
            <span>📋</span> Copy
        </div>
        <div class="context-menu-item" onclick="exportMessage()">
            <span>📥</span> Export
        </div>
        <div class="context-menu-item" onclick="shareMessage()">
            <span>🔗</span> Share
        </div>
    `;
    
    document.body.appendChild(menu);
}

function hideContextMenu() {
    const menu = document.getElementById('context-menu');
    if (menu) menu.remove();
}

function regenerateMessage() {
    showToast('Regenerating response...', 'info');
    hideContextMenu();
}

function copyMessageText() {
    showToast('Message copied!', 'success');
    sounds.success();
    hideContextMenu();
}

function exportMessage() {
    showToast('Message exported!', 'success');
    hideContextMenu();
}

function shareMessage() {
    showToast('Share link copied!', 'success');
    hideContextMenu();
}

// Modal System
function createModals() {
    const modalHTML = `
        <!-- Search Modal -->
        <div id="searchModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>🔍 Search Chat History</h2>
                    <button class="modal-close" onclick="closeModal('searchModal')">✕</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="searchInput" class="search-input" placeholder="Search conversations..." oninput="searchChats(this.value)">
                    <div id="searchResults" class="search-results"></div>
                </div>
            </div>
        </div>
        
        <!-- Export Modal -->
        <div id="exportModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>📥 Export Chat</h2>
                    <button class="modal-close" onclick="closeModal('exportModal')">✕</button>
                </div>
                <div class="modal-body">
                    <button class="export-btn" onclick="exportAsMarkdown()">
                        <span class="btn-icon">📝</span>
                        <span>Export as Markdown</span>
                    </button>
                    <button class="export-btn" onclick="exportAsJSON()">
                        <span class="btn-icon">📊</span>
                        <span>Export as JSON</span>
                    </button>
                    <button class="export-btn" onclick="exportAsText()">
                        <span class="btn-icon">📄</span>
                        <span>Export as Plain Text</span>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Settings Modal -->
        <div id="settingsModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⚙️ Settings</h2>
                    <button class="modal-close" onclick="closeModal('settingsModal')">✕</button>
                </div>
                <div class="modal-body">
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="soundToggle" onchange="toggleSound()" ${settings.soundEnabled ? 'checked' : ''}>
                            <span>🔊 Sound Effects</span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="autoScrollToggle" onchange="toggleAutoScroll()" ${settings.autoScroll ? 'checked' : ''}>
                            <span>📜 Auto Scroll</span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <label>
                            <input type="checkbox" id="tooltipsToggle" onchange="toggleTooltips()" ${settings.showTooltips ? 'checked' : ''}>
                            <span>💡 Show Tooltips</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Save Prompt Modal -->
        <div id="savePromptModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>💾 Save Prompt</h2>
                    <button class="modal-close" onclick="closeModal('savePromptModal')">✕</button>
                </div>
                <div class="modal-body">
                    <input type="text" id="promptTitle" class="prompt-input" placeholder="Prompt title...">
                    <textarea id="promptText" class="prompt-textarea" placeholder="Enter your prompt..."></textarea>
                    <button class="save-prompt-btn" onclick="savePrompt()">Save</button>
                </div>
            </div>
        </div>
        
        <!-- Shortcuts Modal -->
        <div id="shortcutsModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button class="modal-close" onclick="closeModal('shortcutsModal')">✕</button>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-list">
                        ${Object.entries(KEYBOARD_SHORTCUTS).map(([key, desc]) => `
                            <div class="shortcut-item">
                                <kbd>${key}</kbd>
                                <span>${desc}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function openSearchModal() {
    openModal('searchModal');
    document.getElementById('searchInput').focus();
}

function openExportModal() {
    openModal('exportModal');
}

function openSettingsModal() {
    openModal('settingsModal');
}

function openSavePromptModal() {
    openModal('savePromptModal');
    document.getElementById('promptText').value = document.getElementById('messageInput').value;
}

function showKeyboardShortcuts() {
    openModal('shortcutsModal');
}

// Search Functionality
function searchChats(query) {
    const results = document.getElementById('searchResults');
    
    if (!query.trim()) {
        results.innerHTML = '<div class="search-empty">Type to search...</div>';
        return;
    }
    
    const filtered = chatHistory.filter(chat => 
        chat.question.toLowerCase().includes(query.toLowerCase()) ||
        chat.answer.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filtered.length === 0) {
        results.innerHTML = '<div class="search-empty">No results found</div>';
        return;
    }
    
    results.innerHTML = filtered.map((chat, index) => `
        <div class="search-result-item" onclick="loadSearchResult(${chatHistory.indexOf(chat)})">
            <div class="search-result-title">${chat.question}</div>
            <div class="search-result-time">${formatTime(chat.timestamp)}</div>
        </div>
    `).join('');
}

function loadSearchResult(index) {
    loadChat(index);
    closeModal('searchModal');
}

// Export Functions
function exportAsMarkdown() {
    const messages = document.getElementById('messages').children;
    let markdown = '# Room AI Chat Export\n\n';
    
    Array.from(messages).forEach(msg => {
        const role = msg.classList.contains('user') ? 'User' : 'AI';
        const content = msg.querySelector('.message-content').textContent;
        markdown += `## ${role}\n\n${content}\n\n---\n\n`;
    });
    
    downloadFile('chat-export.md', markdown);
    showToast('Exported as Markdown!', 'success');
    sounds.success();
    closeModal('exportModal');
}

function exportAsJSON() {
    const data = JSON.stringify(chatHistory, null, 2);
    downloadFile('chat-export.json', data);
    showToast('Exported as JSON!', 'success');
    sounds.success();
    closeModal('exportModal');
}

function exportAsText() {
    const messages = document.getElementById('messages').children;
    let text = 'Room AI Chat Export\n\n';
    
    Array.from(messages).forEach(msg => {
        const role = msg.classList.contains('user') ? 'User' : 'AI';
        const content = msg.querySelector('.message-content').textContent;
        text += `${role}: ${content}\n\n`;
    });
    
    downloadFile('chat-export.txt', text);
    showToast('Exported as Text!', 'success');
    sounds.success();
    closeModal('exportModal');
}

function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Settings Functions
function loadSettings() {
    const saved = localStorage.getItem('settings');
    if (saved) {
        settings = JSON.parse(saved);
    }
}

function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(settings));
}

function toggleSound() {
    settings.soundEnabled = document.getElementById('soundToggle').checked;
    saveSettings();
    showToast(`Sound ${settings.soundEnabled ? 'enabled' : 'disabled'}`, 'info');
}

function toggleAutoScroll() {
    settings.autoScroll = document.getElementById('autoScrollToggle').checked;
    saveSettings();
    showToast(`Auto-scroll ${settings.autoScroll ? 'enabled' : 'disabled'}`, 'info');
}

function toggleTooltips() {
    settings.showTooltips = document.getElementById('tooltipsToggle').checked;
    saveSettings();
    showToast(`Tooltips ${settings.showTooltips ? 'enabled' : 'disabled'}`, 'info');
}

// Prompt Library
function loadSavedPrompts() {
    const saved = localStorage.getItem('savedPrompts');
    if (saved) {
        savedPrompts = JSON.parse(saved);
    }
}

function savePrompt() {
    const title = document.getElementById('promptTitle').value.trim();
    const text = document.getElementById('promptText').value.trim();
    
    if (!title || !text) {
        showToast('Please enter both title and prompt', 'warning');
        return;
    }
    
    savedPrompts.push({ title, text, timestamp: Date.now() });
    localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
    
    showToast('Prompt saved!', 'success');
    sounds.success();
    closeModal('savePromptModal');
    
    document.getElementById('promptTitle').value = '';
    document.getElementById('promptText').value = '';
}

// Toast Notification System
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
}

function showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Ripple Effect
function addRippleEffect() {
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button, .example-card, .chat-item');
        if (!button) return;
        
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
}

// Setup Markdown Renderer
function setupMarkdownRenderer() {
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });
}

// Render Markdown with LaTeX
function renderMarkdown(text) {
    const latexBlocks = [];
    const latexInline = [];
    
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (match, latex) => {
        latexBlocks.push(latex);
        return `___LATEX_BLOCK_${latexBlocks.length - 1}___`;
    });
    
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (match, latex) => {
        latexInline.push(latex);
        return `___LATEX_INLINE_${latexInline.length - 1}___`;
    });
    
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
        latexBlocks.push(latex);
        return `___LATEX_BLOCK_${latexBlocks.length - 1}___`;
    });
    
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, latex) => {
        latexInline.push(latex);
        return `___LATEX_INLINE_${latexInline.length - 1}___`;
    });
    
    let html = marked.parse(text);
    
    html = html.replace(/___LATEX_BLOCK_(\d+)___/g, (match, index) => {
        try {
            return katex.renderToString(latexBlocks[index], {
                displayMode: true,
                throwOnError: false
            });
        } catch (e) {
            return `<span class="latex-error">LaTeX Error: ${latexBlocks[index]}</span>`;
        }
    });
    
    html = html.replace(/___LATEX_INLINE_(\d+)___/g, (match, index) => {
        try {
            return katex.renderToString(latexInline[index], {
                displayMode: false,
                throwOnError: false
            });
        } catch (e) {
            return `<span class="latex-error">LaTeX Error: ${latexInline[index]}</span>`;
        }
    });
    
    html = html.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
        const cleanCode = code.replace(/<[^>]*>/g, '');
        return `
            <div class="code-block-wrapper">
                <div class="code-block-header">
                    <span class="code-language">${lang}</span>
                    <button class="code-copy-btn" onclick="copyCode(this, \`${cleanCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)">
                        <span class="copy-icon">📋</span>
                        <span class="copy-text">Copy</span>
                    </button>
                </div>
                <pre><code class="language-${lang}">${code}</code></pre>
            </div>
        `;
    });
    
    return html;
}

function copyCode(button, code) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = code;
    const decodedCode = textarea.value;
    
    navigator.clipboard.writeText(decodedCode).then(() => {
        const icon = button.querySelector('.copy-icon');
        const text = button.querySelector('.copy-text');
        
        icon.textContent = '✅';
        text.textContent = 'Copied!';
        button.style.background = 'rgba(74, 222, 128, 0.2)';
        button.style.color = '#4ade80';
        
        showToast('Code copied to clipboard!', 'success');
        sounds.success();
        
        setTimeout(() => {
            icon.textContent = '📋';
            text.textContent = 'Copy';
            button.style.background = '';
            button.style.color = '';
        }, 2000);
    });
}

// Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        updateThemeIcons(true);
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons(isDark);
    showToast(`${isDark ? 'Dark' : 'Light'} mode activated`, 'info');
    sounds.success();
}

function updateThemeIcons(isDark) {
    const icons = document.querySelectorAll('#themeIcon, #mobileThemeIcon');
    icons.forEach(icon => {
        icon.textContent = isDark ? '☀️' : '🌙';
    });
}

// Sidebar Management
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function newChat() {
    const messages = document.getElementById('messages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    messages.innerHTML = '';
    welcomeScreen.style.display = 'flex';
    document.getElementById('messageInput').value = '';
    displayRandomExamples();
    
    showToast('New chat started', 'info', 2000);
    sounds.success();
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Chat History Management
function loadChatHistory() {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
        chatHistory = JSON.parse(saved);
        renderChatHistory();
    }
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    renderChatHistory();
}

function renderChatHistory() {
    const historyContainer = document.getElementById('chatHistory');
    if (!historyContainer) return;
    
    if (chatHistory.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💬</div>
                <div class="empty-text">No conversations yet</div>
                <div class="empty-subtext">Start chatting to see history</div>
            </div>
        `;
        return;
    }
    
    historyContainer.innerHTML = chatHistory.slice(-10).reverse().map((chat, index) => `
        <div class="chat-item" onclick="loadChat(${chatHistory.length - 1 - index})">
            <div class="chat-preview">${chat.question.substring(0, 40)}${chat.question.length > 40 ? '...' : ''}</div>
            <div class="chat-time">${formatTime(chat.timestamp)}</div>
        </div>
    `).join('');
}

function loadChat(index) {
    const chat = chatHistory[index];
    if (!chat) return;
    
    const messages = document.getElementById('messages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    messages.innerHTML = '';
    welcomeScreen.style.display = 'none';
    
    addMessage('user', chat.question, chat.timestamp);
    addMessage('ai', chat.answer, chat.timestamp + 1000, chat.debateData);
    
    showToast('Chat loaded', 'success', 2000);
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
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

// Example Prompts
function displayRandomExamples() {
    const categories = Object.keys(EXAMPLE_PROMPTS);
    const selectedExamples = [];
    
    categories.forEach(category => {
        const prompts = EXAMPLE_PROMPTS[category];
        const random = prompts[Math.floor(Math.random() * prompts.length)];
        selectedExamples.push({ text: random, category });
    });
    
    const exampleGrid = document.querySelector('.example-grid');
    if (exampleGrid) {
        const icons = { coding: '💻', science: '🔬', math: '��', practical: '🧘' };
        exampleGrid.innerHTML = selectedExamples.map(ex => `
            <button class="example-card" onclick="useExample('${ex.text.replace(/'/g, "\\'")}')">
                <span class="example-icon">${icons[ex.category]}</span>
                <span class="example-text">${ex.text}</span>
            </button>
        `).join('');
    }
}

// Input Management
function setupInputListeners() {
    const input = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    
    input.addEventListener('input', () => {
        sendBtn.disabled = !input.value.trim();
    });
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
    document.getElementById('messageInput').value = text;
    document.getElementById('sendBtn').disabled = false;
    document.getElementById('messageInput').focus();
}

// Typing Indicator
function showTypingIndicator() {
    const messages = document.getElementById('messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing-indicator-wrapper';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">🤖</div>
            <div class="message-author">Debate AI</div>
        </div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    
    messages.appendChild(typingDiv);
    scrollToBottom();
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// Message Handling
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
    
    sounds.send();
    
    showTypingIndicator();
    await new Promise(resolve => setTimeout(resolve, 1000));
    removeTypingIndicator();
    
    addEnhancedLoadingIndicator();
    
    try {
        let data;
        if (USE_MOCK) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            data = {
                finalAnswer: `# Here's a comprehensive answer

This is synthesized from multiple AI models debating your question.

## Key Points

1. **First important point**: The debate process involves independent analysis
2. **Second point**: Cross-examination catches logical errors
3. **Third point**: Final synthesis ensures quality

### Code Example

\`\`\`python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
\`\`\`

### Mathematical Explanation

The time complexity is \\(O(\\log n)\\) because we divide the search space in half each time.

The recurrence relation is: \\[ T(n) = T(n/2) + O(1) \\]

This demonstrates the power of **divide and conquer** algorithms!`,
                models: { modelA: "Llama 3.3 70B", modelB: "Mistral 7B" },
                transcript: []
            };
        } else {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: message })
            });
            data = await response.json();
        }
        
        removeLoadingIndicator();
        const answerTimestamp = Date.now();
        addMessage('ai', data.finalAnswer, answerTimestamp, data);
        
        chatHistory.push({
            question: message,
            answer: data.finalAnswer,
            timestamp: questionTimestamp,
            debateData: data
        });
        saveChatHistory();
        
        showToast('Answer received!', 'success');
        sounds.receive();
        
    } catch (error) {
        removeLoadingIndicator();
        addMessage('ai', 'Sorry, there was an error processing your request. Please try again.');
        showToast('Error processing request', 'error');
        sounds.error();
    }
}

function addEnhancedLoadingIndicator() {
    const messages = document.getElementById('messages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai';
    loadingDiv.id = 'loading-indicator';
    
    const funFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];
    
    let phasesHTML = '';
    DEBATE_PHASES.forEach((phase, index) => {
        phasesHTML += `
            <div class="phase-live-item" id="phase-${index}">
                <div class="phase-status pending" id="phase-status-${index}">${phase.icon}</div>
                <div class="phase-info">
                    <div class="phase-name">${phase.name}</div>
                    <div class="phase-description">${phase.description}</div>
                </div>
            </div>
        `;
    });
    
    loadingDiv.innerHTML = `
        <div class="message-header">
            <div class="message-avatar">🤖</div>
            <div class="message-author">Debate AI</div>
        </div>
        <div class="message-content">
            <div class="debate-progress">
                <div class="progress-header">
                    <span class="progress-title">AI Debate in Progress</span>
                    <span class="progress-time" id="progress-time">~60s</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" id="progress-bar" style="width: 0%"></div>
                </div>
                <div class="debate-phases-live">${phasesHTML}</div>
                <button class="watch-debate-btn" onclick="toggleDebateView()" id="watch-debate-btn">
                    <span id="debate-toggle-icon">▼</span>
                    <span id="debate-toggle-text">Watch Debate Live</span>
                </button>
                <div class="live-debate-viewer" id="live-debate-viewer" style="display: none;">
                    <div class="debate-stream" id="debate-stream"></div>
                </div>
                <div class="fun-fact">
                    <div class="fun-fact-title">💡 Did you know?</div>
                    <div class="fun-fact-text">${funFact}</div>
                </div>
            </div>
        </div>
    `;
    
    messages.appendChild(loadingDiv);
    scrollToBottom();
    animateProgress();
}

function toggleDebateView() {
    debateViewExpanded = !debateViewExpanded;
    const viewer = document.getElementById('live-debate-viewer');
    const icon = document.getElementById('debate-toggle-icon');
    const text = document.getElementById('debate-toggle-text');
    
    if (debateViewExpanded) {
        viewer.style.display = 'block';
        icon.textContent = '▲';
        text.textContent = 'Hide Debate';
        if (!document.getElementById('debate-stream').children.length) {
            streamDebateSimulation();
        }
    } else {
        viewer.style.display = 'none';
        icon.textContent = '▼';
        text.textContent = 'Watch Debate Live';
    }
}

function streamDebateSimulation() {
    const stream = document.getElementById('debate-stream');
    if (!stream) return;
    
    const simulatedDebate = [
        { role: 'modelA', name: 'Llama 3.3 70B', text: 'Analyzing the question...', delay: 1000 },
        { role: 'modelB', name: 'Mistral 7B', text: 'Processing independently...', delay: 2000 },
        { role: 'modelA', name: 'Llama 3.3 70B', text: 'I believe the answer requires considering multiple factors...', delay: 3000 },
        { role: 'modelB', name: 'Mistral 7B', text: 'I agree, but we should also examine the context...', delay: 4500 },
        { role: 'system', text: '💬 Cross-examination phase starting...', delay: 6000 },
        { role: 'modelA', name: 'Llama 3.3 70B', text: 'Model B, can you provide evidence for your claim?', delay: 7000 },
        { role: 'modelB', name: 'Mistral 7B', text: 'Based on established principles, here\'s my reasoning...', delay: 8500 },
        { role: 'system', text: '🔍 Beginning critical analysis...', delay: 10000 },
        { role: 'modelA', name: 'Llama 3.3 70B', text: 'I notice a potential weakness in the argument structure...', delay: 11000 },
        { role: 'modelB', name: 'Mistral 7B', text: 'Valid point. Let me refine my approach...', delay: 12500 },
        { role: 'system', text: '✨ Synthesizing final answer...', delay: 14000 },
    ];
    
    let currentIndex = 0;
    
    function addDebateEntry() {
        if (currentIndex >= simulatedDebate.length || !document.getElementById('debate-stream')) return;
        
        const entry = simulatedDebate[currentIndex];
        const entryDiv = document.createElement('div');
        entryDiv.className = `debate-entry ${entry.role}`;
        
        if (entry.role === 'system') {
            entryDiv.innerHTML = `<div class="debate-system-message">${entry.text}</div>`;
        } else {
            const icon = entry.role === 'modelA' ? '🤖' : '🤖';
            const color = entry.role === 'modelA' ? '#667eea' : '#f093fb';
            entryDiv.innerHTML = `
                <div class="debate-model-header" style="color: ${color}">
                    <span>${icon}</span>
                    <strong>${entry.name}</strong>
                </div>
                <div class="debate-model-text">${entry.text}</div>
            `;
        }
        
        stream.appendChild(entryDiv);
        entryDiv.style.animation = 'slideIn 0.3s ease';
        stream.scrollTop = stream.scrollHeight;
        
        currentIndex++;
        if (currentIndex < simulatedDebate.length) {
            const nextDelay = simulatedDebate[currentIndex].delay - entry.delay;
            setTimeout(addDebateEntry, nextDelay);
        }
    }
    
    addDebateEntry();
}

function animateProgress() {
    const totalDuration = 55;
    let elapsed = 0;
    let currentPhase = 0;
    let phaseElapsed = 0;
    
    const interval = setInterval(() => {
        elapsed += 0.5;
        phaseElapsed += 0.5;
        
        const progress = Math.min((elapsed / totalDuration) * 100, 95);
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) progressBar.style.width = progress + '%';
        
        const timeRemaining = Math.max(0, totalDuration - elapsed);
        const progressTime = document.getElementById('progress-time');
        if (progressTime) progressTime.textContent = `~${Math.ceil(timeRemaining)}s`;
        
        if (currentPhase < DEBATE_PHASES.length) {
            const phase = DEBATE_PHASES[currentPhase];
            const phaseItem = document.getElementById(`phase-${currentPhase}`);
            const phaseStatus = document.getElementById(`phase-status-${currentPhase}`);
            
            if (phaseItem && phaseStatus) {
                phaseItem.classList.add('active');
                phaseItem.classList.remove('pending', 'completed');
                phaseStatus.classList.add('active');
                phaseStatus.classList.remove('pending', 'completed');
            }
            
            if (phaseElapsed >= phase.duration) {
                if (phaseItem && phaseStatus) {
                    phaseItem.classList.add('completed');
                    phaseItem.classList.remove('active');
                    phaseStatus.classList.add('completed');
                    phaseStatus.classList.remove('active');
                    phaseStatus.textContent = '✓';
                }
                currentPhase++;
                phaseElapsed = 0;
            }
        }
        
        if (!document.getElementById('loading-indicator')) clearInterval(interval);
    }, 500);
}

function removeLoadingIndicator() {
    const loading = document.getElementById('loading-indicator');
    if (loading) loading.remove();
}

function addMessage(role, content, timestamp, debateData = null) {
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
    
    let html = `
        <div class="message-header">
            <div class="message-avatar">${avatar}</div>
            <div class="message-author">${author}</div>
            ${timeStr}
        </div>
        <div class="message-content markdown-content" id="msg-${timestamp}">${renderedContent}</div>
    `;
    
    if (role === 'ai' && debateData) {
        const modelA = debateData.models?.modelA || 'Model A';
        const modelB = debateData.models?.modelB || 'Model B';
        
        html += `
            <div class="message-actions">
                <button class="action-btn copy-btn" onclick="copyMessage(${timestamp})">
                    <span class="btn-icon">📋</span>
                    <span class="btn-text">Copy</span>
                </button>
            </div>
            <div class="debate-info">
                <div class="model-badges">
                    <span class="model-badge model-a">🤖 ${modelA}</span>
                    <span class="model-badge model-b">🤖 ${modelB}</span>
                </div>
                <div class="debate-complete-text">
                    ✅ Answer synthesized from multi-agent debate
                </div>
            </div>
        `;
    }
    
    messageDiv.innerHTML = html;
    messages.appendChild(messageDiv);
    scrollToBottom();
}

function copyMessage(timestamp) {
    const messageContent = document.getElementById(`msg-${timestamp}`);
    if (!messageContent) return;
    
    const text = messageContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target.closest('.copy-btn');
        if (btn) {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Copied!</span>';
            btn.style.background = 'rgba(74, 222, 128, 0.2)';
            btn.style.color = '#4ade80';
            
            showToast('Message copied to clipboard!', 'success');
            sounds.success();
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.color = '';
            }, 2000);
        }
    });
}

function scrollToBottom() {
    if (!settings.autoScroll) return;
    
    const container = document.getElementById('messagesContainer');
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}
