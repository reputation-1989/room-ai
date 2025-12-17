// Smart Query Classification System
// Automatically detects query type and recommends debate strategy

function classifyQuery(prompt) {
    const promptLower = prompt.toLowerCase();
    
    // Detect CODE queries
    const codeKeywords = [
        'write a function', 'write code', 'implement', 'algorithm',
        'debug', 'fix this code', 'program', 'script', 'class',
        'codeforces', 'leetcode', 'solve:', 'java', 'python', 'c++',
        'javascript', 'code that', 'function to', 'method to'
    ];
    
    // Detect ACADEMIC queries
    const academicKeywords = [
        'explain', 'what is', 'define', 'how does', 'why does',
        'theory', 'principle', 'concept', 'mechanism', 'process',
        'scientific', 'research', 'study', 'formula'
    ];
    
    // Detect CREATIVE queries
    const creativeKeywords = [
        'write a story', 'poem', 'creative', 'imagine', 'brainstorm',
        'design', 'create an idea', 'innovative', 'fictional',
        'narrative', 'character', 'plot'
    ];
    
    // Detect ANALYTICAL queries
    const analyticalKeywords = [
        'should i', 'analyze', 'compare', 'evaluate', 'assess',
        'pros and cons', 'advantages', 'disadvantages', 'versus',
        'better than', 'worth it', 'which is best'
    ];
    
    // Detect RECOMMENDATION queries
    const recommendationKeywords = [
        'recommend', 'suggest', 'best', 'top', 'which', 'what should',
        'help me choose', 'looking for', 'need', 'want to buy'
    ];
    
    // Count matches for each category
    const scores = {
        code: codeKeywords.filter(kw => promptLower.includes(kw)).length,
        academic: academicKeywords.filter(kw => promptLower.includes(kw)).length,
        creative: creativeKeywords.filter(kw => promptLower.includes(kw)).length,
        analytical: analyticalKeywords.filter(kw => promptLower.includes(kw)).length,
        recommendation: recommendationKeywords.filter(kw => promptLower.includes(kw)).length
    };
    
    // Find highest scoring category
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
        return {
            type: 'general',
            mode: 'Standard Debate',
            strategy: 'Multi-perspective collaborative reasoning',
            enableCodeExecution: false,
            debateStyle: 'balanced'
        };
    }
    
    // Return classification
    if (scores.code === maxScore) {
        return {
            type: 'code',
            mode: 'Code Execution & Harsh Debugging',
            strategy: 'Execute code, generate adversarial test cases, debug collaboratively',
            enableCodeExecution: true,
            debateStyle: 'harsh'
        };
    } else if (scores.creative === maxScore) {
        return {
            type: 'creative',
            mode: 'Creative Collaboration',
            strategy: 'Generate multiple creative approaches, combine best elements',
            enableCodeExecution: false,
            debateStyle: 'collaborative'
        };
    } else if (scores.analytical === maxScore) {
        return {
            type: 'analytical',
            mode: 'Critical Analysis',
            strategy: 'Challenge assumptions, pros/cons, devil\'s advocate',
            enableCodeExecution: false,
            debateStyle: 'adversarial'
        };
    } else if (scores.recommendation === maxScore) {
        return {
            type: 'recommendation',
            mode: 'Recommendation Engine',
            strategy: 'Evaluate options against criteria, compare alternatives',
            enableCodeExecution: false,
            debateStyle: 'comparative'
        };
    } else {
        return {
            type: 'academic',
            mode: 'Academic Validation',
            strategy: 'Fact-check, validate claims, provide comprehensive explanation',
            enableCodeExecution: false,
            debateStyle: 'rigorous'
        };
    }
}

export { classifyQuery };
