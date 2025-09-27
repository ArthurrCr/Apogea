// ======================
// STATS SIMULATOR
// ======================
import { createStars } from './modules/stars.js';
import { initLanguageSelector } from './modules/language.js';
import { getURLParameter, clamp, formatNumber } from './modules/utilities.js';
import { classMultipliers, baseStats } from './data/stats-config.js';

// Global variables
let currentClass = 'knight';
let currentLevel = 1;
let availablePoints = 0; 
let usedPoints = 0;

// Calculate points from level
function calculatePointsFromLevel(level) {
    return (level - 1) * 3;
}

// Calculate stat value based on formula
function calculateStatValue(stat, multiplier) {
    let bonus = 0;
    
    if (stat.formula && stat.points > 0) {
        bonus = stat.formula(stat.points);
    }
    
    const bonusWithMultiplier = bonus * multiplier;
    const finalValue = stat.base + bonusWithMultiplier;
    
    return { bonus: bonusWithMultiplier, finalValue };
}

// Render stats table
function renderStats() {
    const tbody = document.getElementById('statsTableBody');
    tbody.innerHTML = '';
    
    const multipliers = classMultipliers[currentClass];
    
    for (const [key, stat] of Object.entries(baseStats)) {
        const row = document.createElement('tr');
        const multiplier = multipliers[key] || 1;
        
        const { bonus, finalValue } = calculateStatValue(stat, multiplier);
        
        let multClass = '';
        if (multiplier > 1) multClass = 'high';
        else if (multiplier < 1) multClass = 'low';
        
        const statName = (typeof t !== 'undefined') ? t(`stat.${stat.key}`) : stat.key;
        
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
    
    if (!stat.editable) return;
    
    const totalPoints = calculatePointsFromLevel(currentLevel);
    const maxPointsPerStat = currentLevel;
    
    if (change > 0) {
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

// Initialize level input
function initLevelInput() {
    const levelInput = document.getElementById('levelInput');
    if (levelInput) {
        levelInput.addEventListener('input', function() {
            const newLevel = clamp(parseInt(this.value) || 1, 1, 100);
            if (newLevel !== currentLevel) {
                currentLevel = newLevel;
                this.value = newLevel;
                resetPoints();
                updatePointsDisplay();
            }
        });
    }
}

// Initialize
function init() {
    // Obtém classe da URL
    currentClass = getURLParameter('class') || 'knight';
    
    // Inicializa componentes compartilhados
    createStars();
    initLanguageSelector(() => renderStats());
    
    // Inicializa componentes específicos
    initLevelInput();
    renderStats();
    updatePointsDisplay();
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Expõe globalmente para onclick dos botões
window.adjustStat = adjustStat;