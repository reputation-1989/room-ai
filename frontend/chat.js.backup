const API_URL = 'https://room-ai-debate-engine.onrender.com/api/debate';
const USE_MOCK = true;

const DEBATE_PHASES = [
    {
        name: "Independent Solutions",
        icon: "🧠",
        description: "AI models are analyzing your question independently",
        duration: 15
    },
    {
        name: "Cross-Examination",
        icon: "💬",
        description: "Models are challenging each other's reasoning",
        duration: 15
    },
    {
        name: "Critical Analysis",
        icon: "🔍",
        description: "Deep critique to catch errors and validate logic",
        duration: 15
    },
    {
        name: "Final Synthesis",
        icon: "✨",
        description: "Creating the best answer from all insights",
        duration: 10
    }
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

let debateViewExpanded = false;
let currentDebateData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    setupInputListeners();
});

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
}

function updateThemeIcons(isDark) {
    const icons = document.querySelectorAll('#themeIcon, #mobileThemeIcon');
    icons.forEach(icon => {
        icon.textContent = isDark ? '☀️' : '🌙';
    });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function newChat() {
    const messages = document.getElementById('messages');
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    messages.innerHTML = '';
    welcomeScreen.style.display = 'flex';
    document.getElementById('messageInput').value = '';
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

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

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    document.getElementById('welcomeScreen').style.display = 'none';
    addMessage('user', message);
    
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('sendBtn').disabled = true;
    
    addEnhancedLoadingIndicator();
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: message })
        });
        
        const data = await response.json();
        currentDebateData = data;
        removeLoadingIndicator();
        addMessage('ai', data.finalAnswer, data);
    } catch (error) {
        removeLoadingIndicator();
        addMessage('ai', 'Sorry, there was an error processing your request. Please try again.');
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
                <div class="phase-status pending" id="phase-status-${index}">
                    ${phase.icon}
                </div>
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
                <div class="debate-phases-live">
                    ${phasesHTML}
                </div>
                
                <button class="watch-debate-btn" onclick="toggleDebateView()" id="watch-debate-btn">
                    <span id="debate-toggle-icon">▼</span>
                    <span id="debate-toggle-text">Watch Debate Live</span>
                </button>
                
                <div class="live-debate-viewer" id="live-debate-viewer" style="display: none;">
                    <div class="debate-stream" id="debate-stream">
                        <!-- Live debate will appear here -->
                    </div>
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
        
        // Start streaming debate simulation
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
        if (currentIndex >= simulatedDebate.length || !document.getElementById('debate-stream')) {
            return;
        }
        
        const entry = simulatedDebate[currentIndex];
        const entryDiv = document.createElement('div');
        entryDiv.className = `debate-entry ${entry.role}`;
        
        if (entry.role === 'system') {
            entryDiv.innerHTML = `
                <div class="debate-system-message">${entry.text}</div>
            `;
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
        
        // Auto-scroll
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
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        const timeRemaining = Math.max(0, totalDuration - elapsed);
        const progressTime = document.getElementById('progress-time');
        if (progressTime) {
            progressTime.textContent = `~${Math.ceil(timeRemaining)}s`;
        }
        
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
        
        if (!document.getElementById('loading-indicator')) {
            clearInterval(interval);
        }
    }, 500);
}

function removeLoadingIndicator() {
    const loading = document.getElementById('loading-indicator');
    if (loading) loading.remove();
}

function addMessage(role, content, debateData = null) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const avatar = role === 'user' ? '👤' : '🤖';
    const author = role === 'user' ? 'You' : 'Debate AI';
    
    let html = `
        <div class="message-header">
            <div class="message-avatar">${avatar}</div>
            <div class="message-author">${author}</div>
        </div>
        <div class="message-content">${escapeHtml(content)}</div>
    `;
    
    if (role === 'ai' && debateData) {
        html += `
            <div class="debate-info" style="margin-top: 1rem; padding: 1rem; background: var(--bg-secondary); border-radius: 12px; border-left: 3px solid var(--accent);">
                <strong>✅ Debate Complete</strong>
                <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                    This answer was synthesized from multiple AI models through structured debate.
                </div>
                <button class="view-transcript-btn" onclick="alert('Full transcript viewer coming soon!')">
                    📝 View Full Transcript
                </button>
            </div>
        `;
    }
    
    messageDiv.innerHTML = html;
    messages.appendChild(messageDiv);
    scrollToBottom();
}

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}
