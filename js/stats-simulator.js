// Class Multipliers
const classMultipliers = {
    squire: {
        skill: 1.00, magic: 1.00, armor: 1.00, defense: 1.00,
        health: 1.00, mana: 1.00, capacity: 1.00, hpRegen: 1.00,
        mpRegen: 1.00, attackSpeed: 1.00, damage: 1.00, movespeed: 1.00,
        ability: 1.00, range: 1.00
    },
    knight: {
        skill: 1.25, magic: 0.50, armor: 1.50, defense: 1.50,
        health: 2.00, mana: 0.50, capacity: 1.50, hpRegen: 1.25,
        mpRegen: 0.50, attackSpeed: 1.00, damage: 1.00, movespeed: 1.00,
        ability: 1.25, range: 1.00
    },
    mage: {
        skill: 0.75, magic: 2.00, armor: 0.75, defense: 0.75,
        health: 0.75, mana: 2.00, capacity: 0.75, hpRegen: 0.75,
        mpRegen: 2.00, attackSpeed: 1.00, damage: 1.00, movespeed: 1.00,
        ability: 1.00, range: 1.00
    },
    rogue: {
        skill: 1.50, magic: 1.50, armor: 1.00, defense: 1.00,
        health: 1.00, mana: 1.25, capacity: 1.00, hpRegen: 1.00,
        mpRegen: 1.00, attackSpeed: 1.25, damage: 1.00, movespeed: 1.00,
        ability: 1.00, range: 1.00
    }
};

// Base Stats - TODOS IGUAIS (sem multiplicador base)
const baseStats = {
    health: { 
        key: 'health', 
        base: 150, 
        points: 0, 
        editable: true,
        formula: (points) => points * 5  // (1×5) * multiplicador
    },
    mana: { 
        key: 'mana', 
        base: 15, 
        points: 0, 
        editable: true,
        formula: (points) => points * 5  // (1×5)
    },
    magic: { 
        key: 'magic', 
        base: 0, 
        points: 0, 
        editable: true,
        formula: (points) => points * 1  // (1×1)
    },
    damage: { 
        key: 'damage', 
        base: 0, 
        points: 0, 
        editable: false 
    },
    movespeed: { 
        key: 'movespeed', 
        base: 35, 
        points: 0, 
        editable: false 
    },
    ability: { 
        key: 'ability', 
        base: 0, 
        points: 0, 
        editable: true,
        formula: (points) => points * 1  // (1×1)
    },
    skill: { 
        key: 'skill', 
        base: 0, 
        points: 0, 
        editable: false 
    },
    attackSpeed: { 
        key: 'attackSpeed', 
        base: 10, 
        points: 0, 
        editable: false 
    },
    hpRegen: { 
        key: 'hpRegen', 
        base: 1, 
        points: 0, 
        editable: true,
        formula: (points) => points * 1  // (1×1)
    },
    mpRegen: { 
        key: 'mpRegen', 
        base: 1, 
        points: 0, 
        editable: true,
        formula: (points) => points * 1  // (1×1)
    },
    range: { 
        key: 'range', 
        base: 15, 
        points: 0, 
        editable: false 
    },
    armor: { 
        key: 'armor', 
        base: 0, 
        points: 0, 
        editable: false 
    },
    defense: { 
        key: 'defense', 
        base: 0, 
        points: 0, 
        editable: false 
    },
    capacity: { 
        key: 'capacity', 
        base: 225, 
        points: 0, 
        editable: true,
        formula: (points) => points * 25  // (1×25)
    }
};

// Global variables
let currentClass = 'knight';
let currentLevel = 1;
let availablePoints = 0; 
let usedPoints = 0;

// Get class from URL
function getClassFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('class') || 'knight';
}

// Calculate points from level
function calculatePointsFromLevel(level) {
    return (level - 1) * 3; // Nível 1 = 0 pontos, depois 3 por nível
}

// Create stars
function createStars() {
    const starsContainer = document.getElementById('stars');
    const numberOfStars = 150;
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random();
        if (size < 0.5) {
            star.classList.add('small');
        } else if (size < 0.8) {
            star.classList.add('medium');
        } else {
            star.classList.add('large');
        }
        
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (Math.random() * 3 + 3) + 's';
        
        starsContainer.appendChild(star);
    }
}

// Calculate stat value based on formula
function calculateStatValue(stat, multiplier) {
    let bonus = 0;
    
    // Se o stat tem fórmula específica, usa ela
    if (stat.formula && stat.points > 0) {
        bonus = stat.formula(stat.points);
    }
    
    // Calcula valor final: (base + bonus) × multiplicador
    const finalValue = (stat.base + bonus) * multiplier;
    return { bonus, finalValue };
}

// Render stats table
function renderStats() {
    const tbody = document.getElementById('statsTableBody');
    tbody.innerHTML = '';
    
    const multipliers = classMultipliers[currentClass];
    
    for (const [key, stat] of Object.entries(baseStats)) {
        const row = document.createElement('tr');
        const multiplier = multipliers[key] || 1;
        
        // Calcula valores usando a nova fórmula
        const { bonus, finalValue } = calculateStatValue(stat, multiplier);
        
        let multClass = '';
        if (multiplier > 1) multClass = 'high';
        else if (multiplier < 1) multClass = 'low';
        
        // Usa tradução se disponível
        const statName = (typeof t !== 'undefined') ? t(`stat.${stat.key}`) : stat.key;
        
        // Define se mostra controles ou não
        const controlsHTML = stat.editable ? 
            `<div class="controls">
                <button class="btn-adjust" onclick="adjustStat('${key}', -1)">-</button>
                <span class="pts-value">${stat.points}</span>
                <button class="btn-adjust" onclick="adjustStat('${key}', 1)">+</button>
            </div>` : 
            `<span class="pts-value disabled">-</span>`;
        
        row.innerHTML = `
            <td class="stat-name">${statName}</td>
            <td class="multiplier ${multClass}">${(multiplier * 100).toFixed(0)}%</td>
            <td class="value">${stat.base}</td>
            <td>${controlsHTML}</td>
            <td class="value hide-mobile">+${bonus}</td>
            <td class="value final">${finalValue % 1 === 0 ? finalValue : finalValue.toFixed(1)}</td>
        `;
        
        tbody.appendChild(row);
    }
}

// Adjust stat points
function adjustStat(statKey, change) {
    const stat = baseStats[statKey];
    
    // Verifica se o stat é editável
    if (!stat.editable) return;
    
    const totalPoints = calculatePointsFromLevel(currentLevel);
    const maxPointsPerStat = currentLevel; // NOVO: Máximo de pontos por stat = nível
    
    if (change > 0) {
        // Verifica se tem pontos disponíveis E se não passou do máximo por stat
        if (usedPoints < totalPoints && stat.points < maxPointsPerStat) {
            stat.points++;
            usedPoints++;
        }
    } else if (change < 0 && stat.points > 0) {
        stat.points--;
        usedPoints--;
    }
    
    renderStats();
    updatePointsDisplay();
}

// Update points display
function updatePointsDisplay() {
    const totalPoints = calculatePointsFromLevel(currentLevel);
    const remainingPoints = totalPoints - usedPoints;
    availablePoints = remainingPoints;
    document.getElementById('availablePoints').textContent = remainingPoints;
}

// Reset all points
function resetPoints() {
    usedPoints = 0;
    for (const stat of Object.values(baseStats)) {
        if (stat.editable) {
            stat.points = 0;
        }
    }
    renderStats();
    updatePointsDisplay();
}

// Update translations on page
function updatePageTranslations() {
    renderStats();
}

// Initialize
function init() {
    currentClass = getClassFromURL();
    
    createStars();
    
    // Configura input de nível
    const levelInput = document.getElementById('levelInput');
    if (levelInput) {
        levelInput.addEventListener('input', function() {
            const newLevel = parseInt(this.value) || 1;
            if (newLevel >= 1 && newLevel <= 100) {
                currentLevel = newLevel;
                resetPoints();
                updatePointsDisplay();
            }
        });
    }
    
    // Configura botões de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const savedLang = localStorage.getItem('gameLanguage') || 'en';
        if (btn.dataset.lang === savedLang) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (typeof setLanguage !== 'undefined') {
                setLanguage(lang);
            }
            
            setTimeout(() => {
                updatePageTranslations();
            }, 100);
        });
    });
    
    renderStats();
    updatePointsDisplay();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Expõe globalmente
window.adjustStat = adjustStat;