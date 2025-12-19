const API_URL = 'https://room-ai-debate-engine.onrender.com/api/debate';

let queryInput, queryTypeBadge;

document.addEventListener('DOMContentLoaded', function() {
    queryInput = document.getElementById('queryInput');
    queryTypeBadge = document.getElementById('queryTypeBadge');
    
    if (queryInput && queryTypeBadge) {
        queryInput.addEventListener('input', function() {
            const query = queryInput.value.toLowerCase().trim();
            
            if (!query) {
                queryTypeBadge.style.display = 'none';
                return;
            }
            
            let type = 'general';
            let icon = '💬';
            
            if (query.includes('write') || query.includes('code') || query.includes('function') || 
                query.includes('program') || query.includes('algorithm')) {
                type = 'code';
                icon = '💻';
            } else if (query.includes('explain') || query.includes('what is') || query.includes('how does') ||
                       query.includes('define') || query.includes('theory')) {
                type = 'academic';
                icon = '📚';
            } else if (query.includes('poem') || query.includes('story') || query.includes('creative') ||
                       query.includes('imagine') || query.includes('describe')) {
                type = 'creative';
                icon = '🎨';
            }
            
            queryTypeBadge.textContent = icon + ' ' + type.charAt(0).toUpperCase() + type.slice(1) + ' Mode';
            queryTypeBadge.className = 'query-type-badge ' + type;
            queryTypeBadge.style.display = 'inline-flex';
        });
        
        queryInput.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                startDebate();
            }
        });
    }
});

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-toggle');
    if (icon) {
        icon.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    }
}

function scrollToApp() {
    const appSection = document.getElementById('app');
    if (appSection) {
        appSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            const input = document.getElementById('queryInput');
            if (input) input.focus();
        }, 500);
    }
}

function useExamplePrompt(prompt) {
    const input = document.getElementById('queryInput');
    if (input) {
        input.value = prompt;
        input.dispatchEvent(new Event('input'));
        input.focus();
    }
}

async function startDebate() {
    if (!queryInput) {
        queryInput = document.getElementById('queryInput');
    }
    
    if (!queryInput) {
        alert('Error: Query input field not found!');
        return;
    }
    
    const query = queryInput.value.trim();
    
    if (!query) {
        alert('Please enter a question!');
        return;
    }
    
    const loadingState = document.getElementById('loadingState');
    const resultsSection = document.getElementById('resultsSection');
    
    if (loadingState) loadingState.style.display = 'block';
    if (resultsSection) resultsSection.style.display = 'none';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: query })
        });
        
        if (!response.ok) {
            throw new Error('Server responded with status: ' + response.status);
        }
        
        const data = await response.json();
        
        if (loadingState) loadingState.style.display = 'none';
        displayResults(data);
        
    } catch (error) {
        if (loadingState) loadingState.style.display = 'none';
        
        const errorMsg = error.message.includes('429') || error.message.includes('Rate limit')
            ? 'API rate limit reached! Please try again tomorrow or add credits to OpenRouter.'
            : 'Error: ' + error.message;
            
        alert(errorMsg);
        console.error('Debate error:', error);
    }
}

function displayResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const finalAnswer = document.getElementById('finalAnswer');
    const transcriptContent = document.getElementById('transcriptContent');
    
    // Display final answer
    if (finalAnswer) {
        finalAnswer.innerHTML = `
            <button class="copy-btn" onclick="copyToClipboard()">�� Copy</button>
            ${escapeHtml(data.finalAnswer || 'No answer generated.')}
        `;
    }
    
    // Display transcript
    if (transcriptContent && data.transcript) {
        transcriptContent.innerHTML = '';
        
        data.transcript.forEach((phaseEntry, index) => {
            const phaseDiv = document.createElement('div');
            phaseDiv.className = 'phase-section';
            
            const phaseIcons = {
                'Independent Solutions': '🧠',
                'Cross-Examination': '💬',
                'Critique': '🔍',
                'Final Synthesis': '✨'
            };
            
            const icon = phaseIcons[phaseEntry.phase] || '📌';
            
            phaseDiv.innerHTML = `
                <div class="phase-header" onclick="togglePhase(${index})">
                    <div class="phase-title">${icon} ${phaseEntry.phase}</div>
                    <div class="toggle-icon">▼</div>
                </div>
                <div class="phase-content" id="phase-${index}">
                    ${renderPhaseContent(phaseEntry)}
                </div>
            `;
            
            transcriptContent.appendChild(phaseDiv);
        });
    }
    
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function renderPhaseContent(phaseEntry) {
    if (phaseEntry.phase === 'Final Synthesis') {
        return `<div class="response-text">${escapeHtml(phaseEntry.synthesis || '')}</div>`;
    }
    
    if (phaseEntry.modelA && phaseEntry.modelB) {
        return `
            <div class="model-comparison">
                <div class="model-response model-a">
                    <div class="model-name">🤖 Model A: ${phaseEntry.modelA.name || 'Unknown'}</div>
                    <div class="response-text">${escapeHtml(phaseEntry.modelA.response || phaseEntry.modelA.defense || phaseEntry.modelA.critique || phaseEntry.modelA.question || 'No response')}</div>
                </div>
                <div class="model-response model-b">
                    <div class="model-name">🤖 Model B: ${phaseEntry.modelB.name || 'Unknown'}</div>
                    <div class="response-text">${escapeHtml(phaseEntry.modelB.response || phaseEntry.modelB.defense || phaseEntry.modelB.critique || phaseEntry.modelB.question || 'No response')}</div>
                </div>
            </div>
        `;
    }
    
    return `<pre>${JSON.stringify(phaseEntry, null, 2)}</pre>`;
}

function togglePhase(index) {
    const content = document.getElementById(`phase-${index}`);
    const header = content.previousElementSibling;
    
    if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        header.classList.remove('collapsed');
    } else {
        content.classList.add('hidden');
        header.classList.add('collapsed');
    }
}

function copyToClipboard() {
    const finalAnswer = document.getElementById('finalAnswer');
    if (finalAnswer) {
        const text = finalAnswer.textContent.replace('📋 Copy', '').trim();
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.querySelector('.copy-btn');
            if (btn) {
                btn.textContent = '✅ Copied!';
                setTimeout(() => {
                    btn.textContent = '📋 Copy';
                }, 2000);
            }
        });
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
