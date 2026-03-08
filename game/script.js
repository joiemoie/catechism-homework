let currentScenario = null;
let currentNodeId = null;
let lastStableNodeId = null; // New variable to track history
let playerHealth = 0;
let opponentHealth = 0;
let maxPlayerHealth = 0;
let maxOpponentHealth = 0;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const opponentText = document.getElementById('opponent-text');
const choicesContainer = document.getElementById('choices-container');
const opponentPortrait = document.getElementById('opponent-portrait');
const credibilityBar = document.getElementById('credibility-bar');
const resolveBar = document.getElementById('resolve-bar');
const gameOverTitle = document.getElementById('game-over-title');
const gameOverMessage = document.getElementById('game-over-message');
const gameContainer = document.getElementById('game-container');

function startGame(opponentKey) {
    if (!SCENARIOS[opponentKey]) {
        console.error("Scenario not found:", opponentKey);
        return;
    }

    currentScenario = SCENARIOS[opponentKey];
    playerHealth = currentScenario.maxPlayerHealth;
    opponentHealth = currentScenario.maxOpponentHealth;
    maxPlayerHealth = currentScenario.maxPlayerHealth;
    maxOpponentHealth = currentScenario.maxOpponentHealth;
    currentNodeId = currentScenario.startNode;
    lastStableNodeId = currentScenario.startNode; // Initialize

    // UI Setup
    opponentPortrait.style.backgroundImage = `url('${currentScenario.portrait}')`;
    
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');

    updateBars();
    renderNode(currentNodeId);
}

function renderNode(nodeId) {
    const node = currentScenario.nodes[nodeId];
    
    // Check if this node is a win/loss terminal state not handled by choices
    if (nodeId === 'victory') {
        endGame(true);
        return;
    }
    if (nodeId === 'defeat') {
        endGame(false);
        return;
    }

    // Typewriter effect (simplified)
    opponentText.innerText = node.text;
    
    choicesContainer.innerHTML = '';

    // Clone choices to not mutate original order in scenarios
    let choices = [...node.choices];
    
    // Shuffle choices if there are more than 1
    if (choices.length > 1) {
        choices = shuffleArray(choices);
    }

    choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.classList.add('choice-btn');
        btn.innerText = choice.text;
        
        // Add data-type for styling (optional hint system)
        if(choice.type) {
            btn.setAttribute('data-type', choice.type);
        }

        btn.onclick = () => makeChoice(choice, node); // Pass the whole choice object
        choicesContainer.appendChild(btn);
    });
}

const playerThought = document.getElementById('player-thought');

function makeChoice(choice, currentNode) {
    // Show internal thought if available
    if (choice.thought) {
        showPlayerThought(choice.thought);
    }

    // Apply effects
    if (choice.playerDamage > 0) {
        playerHealth -= choice.playerDamage;
        triggerShake();
        showFeedback("HOLD IT!", "take-that-bubble", false); // "Objection" against player
    }
    
    if (choice.opponentDamage > 0) {
        opponentHealth -= choice.opponentDamage;
        triggerShake();
        showFeedback("OBJECTION!", "objection-bubble", true);
    }

    updateBars();

    // Check Win/Loss conditions
    if (playerHealth <= 0) {
        endGame(false);
        return;
    }

    if (opponentHealth <= 0 || choice.nextNode === 'victory') {
        endGame(true);
        return;
    }

    // Logic for returning to previous node on fail states
    if (choice.type === 'aggro' || choice.type === 'fallacy') {
        lastStableNodeId = currentNodeId; // Remember where we made the mistake
    }

    if (choice.nextNode === 'RETURN') {
        currentNodeId = lastStableNodeId || 'root';
    } else {
        currentNodeId = choice.nextNode;
    }
    
    // Small delay to let animations play if hit
    const delay = (choice.opponentDamage > 0 || choice.playerDamage > 0) ? 1000 : 0;
    
    setTimeout(() => {
        renderNode(currentNodeId);
    }, delay);
}

function showPlayerThought(text) {
    playerThought.innerText = text;
    playerThought.classList.remove('hidden');
    
    // Hide after 4 seconds
    setTimeout(() => {
        playerThought.classList.add('hidden');
    }, 4000);
}

function updateBars() {
    const pPercent = (playerHealth / maxPlayerHealth) * 100;
    const oPercent = (opponentHealth / maxOpponentHealth) * 100;

    credibilityBar.style.width = `${Math.max(0, pPercent)}%`;
    resolveBar.style.width = `${Math.max(0, oPercent)}%`;
}

function endGame(won) {
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');

    if (won) {
        gameOverTitle.innerText = "DEBATE WON!";
        gameOverTitle.style.color = "#2ecc71";
        gameOverMessage.innerText = `You have successfully dismantled ${currentScenario.name}'s dialectic. The logic of your argument was undeniable.`;
    } else {
        gameOverTitle.innerText = "DEBATE LOST";
        gameOverTitle.style.color = "#e74c3c";
        gameOverMessage.innerText = "Your arguments crumbled under scrutiny. You have lost all credibility.";
    }
}

// Visual Effects

function triggerShake() {
    gameContainer.classList.add('shake');
    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 500);
}

function showFeedback(text, className, isPlayer) {
    const layer = document.createElement('div');
    layer.id = 'overlay-layer';
    
    const bubble = document.createElement('div');
    bubble.classList.add(className);
    bubble.innerText = text;
    
    layer.appendChild(bubble);
    document.body.appendChild(layer);

    setTimeout(() => {
        layer.remove();
    }, 1000);
}

// Utility
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}