const API_URL = 'https://room-ai-debate-engine.onrender.com/api/debate';

async function startDebate() {
    const promptInput = document.getElementById('promptInput');
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        alert('Please enter a question!');
        return;
    }
    
    // Hide results, show loading
    document.getElementById('results').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    document.getElementById('startDebate').disabled = true;
    
    // Simulate phase updates
    const phases = [
        'Starting debate...',
        '📝 Phase 1: Independent reasoning...',
        '🔍 Phase 2: Cross-examination...',
        '⚔️ Phase 3: Mutual critique...',
        '🎯 Phase 4: Generating final answer...'
    ];
    
    let phaseIndex = 0;
    const phaseInterval = setInterval(() => {
        if (phaseIndex < phases.length) {
            document.getElementById('loadingPhase').textContent = phases[phaseIndex];
            phaseIndex++;
        }
    }, 3000);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt })
        });
        
        clearInterval(phaseInterval);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        displayResults(data);
        
    } catch (error) {
        clearInterval(phaseInterval);
        alert('Error: ' + error.message + '\n\nThe API might be waking up (takes 30 sec on first request). Please try again!');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('startDebate').disabled = false;
    }
}

function displayResults(data) {
    // Hide loading, show results
    document.getElementById('loading').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    // Phase 1: Independent Solutions
    const phase1 = data.transcript.find(t => t.phase === 'Independent Solutions');
    document.getElementById('responseA').textContent = phase1.modelA.response;
    document.getElementById('responseB').textContent = phase1.modelB.response;
    
    // Phase 2: Cross-Examination
    const phase2 = data.transcript.find(t => t.phase === 'Cross-Examination');
    document.getElementById('questionFromA').textContent = phase2.modelB.question;
    document.getElementById('defenseB').textContent = phase2.modelB.defense;
    document.getElementById('questionFromB').textContent = phase2.modelA.question;
    document.getElementById('defenseA').textContent = phase2.modelA.defense;
    
    // Phase 3: Critique
    const phase3 = data.transcript.find(t => t.phase === 'Critique');
    document.getElementById('critiqueA').textContent = phase3.modelA.critique;
    document.getElementById('critiqueB').textContent = phase3.modelB.critique;
    
    // Phase 4: Final Answer
    document.getElementById('finalAnswer').textContent = data.finalAnswer;
    
    // Metadata
    document.getElementById('duration').textContent = data.metadata.duration;
    document.getElementById('models').textContent = `${data.models.modelA} vs ${data.models.modelB}`;
    
    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
}

function askAnother() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('promptInput').value = '';
    document.getElementById('startDebate').disabled = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Allow Enter key to submit (Ctrl+Enter or Cmd+Enter)
document.getElementById('promptInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        startDebate();
    }
});
