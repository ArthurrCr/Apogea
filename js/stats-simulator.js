// Class Multipliers (continua igual)
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

// Base Stats ATUALIZADO com chaves de tradução
const baseStats = {
    health: { key: 'health', base: 150, points: 0 },
    mana: { key: 'mana', base: 15, points: 0 },
    magic: { key: 'magic', base: 0, points: 0 },
    damage: { key: 'damage', base: 0, points: 0 },
    movespeed: { key: 'movespeed', base: 35, points: 0 },
    ability: { key: 'ability', base: 0, points: 0 },
    skill: { key: 'skill', base: 0, points: 0 },
    attackSpeed: { key: 'attackSpeed', base: 10, points: 0 },
    hpRegen: { key: 'hpRegen', base: 1, points: 0 },
    mpRegen: { key: 'mpRegen', base: 1, points: 0 },
    range: { key: 'range', base: 15, points: 0 },
    armor: { key: 'armor', base: 0, points: 0 },
    defense: { key: 'defense', base: 0, points: 0 },
    capacity: { key: 'capacity', base: 225, points: 0 }
};

let currentClass = 'knight';
let availablePoints = 100;

// Get class from URL
function getClassFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('class') || 'knight';
}

// Create stars (igual)
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

// Render stats table ATUALIZADO com tradução
function renderStats() {
    const tbody = document.getElementById('statsTableBody');
    tbody.innerHTML = '';
    
    const multipliers = classMultipliers[currentClass];
    
    for (const [key, stat] of Object.entries(baseStats)) {
        const row = document.createElement('tr');
        const multiplier = multipliers[key] || 1;
        const bonus = stat.points * 5;
        const finalValue = (stat.base + bonus) * multiplier;
        
        let multClass = '';
        if (multiplier > 1) multClass = 'high';
        else if (multiplier < 1) multClass = 'low';
        
        // USA TRADUÇÃO PARA O NOME DO STAT
        const statName = t(`stat.${stat.key}`);
        
        row.innerHTML = `
            <td class="stat-name">${statName}</td>
            <td class="multiplier ${multClass}">${(multiplier * 100).toFixed(0)}%</td>
            <td class="value">${stat.base}</td>
            <td>
                <div class="controls">
                    <button class="btn-adjust" onclick="adjustStat('${key}', -1)">-</button>
                    <span class="pts-value">${stat.points}</span>
                    <button class="btn-adjust" onclick="adjustStat('${key}', 1)">+</button>
                </div>
            </td>
            <td class="value hide-mobile">+${bonus}</td>
            <td class="value final">${finalValue.toFixed(0)}</td>
        `;
        
        tbody.appendChild(row);
    }
}

// Adjust stat points (continua igual)
function adjustStat(statKey, change) {
    const stat = baseStats[statKey];
    
    if (change > 0 && availablePoints > 0) {
        stat.points++;
        availablePoints--;
    } else if (change < 0 && stat.points > 0) {
        stat.points--;
        availablePoints++;
    }
    
    renderStats();
    updatePointsDisplay();
}

// Update points display
function updatePointsDisplay() {
    document.getElementById('availablePoints').textContent = availablePoints;
}

// Initialize
function init() {
    currentClass = getClassFromURL();
    
    // Traduz o nome da classe
    const classNameKey = `class.${currentClass}`;
    document.getElementById('classTitle').textContent = t(classNameKey).toUpperCase();
    
    createStars();
    renderStats();
    updatePointsDisplay();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);