// ======================
// STATS SIMULATOR
// ======================
import { createStars } from './modules/stars.js';
import { initLanguageSelector } from './modules/language.js';
import { getURLParameter, clamp, formatNumber } from './modules/utilities.js';
import { classMultipliers, baseStats } from './data/stats-config.js';
import { t, initTranslations } from './translations.js';

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
        
        const statName = t(`stat.${stat.key}`);
        
        const controlsHTML = stat.editable ? 
            `<div class="controls">
                <button class="btn-adjust" data-stat="${key}" data-action="decrease">-</button>
                <span class="pts-value">${stat.points}</span>
                <button class="btn-adjust" data-stat="${key}" data-action="increase">+</button>
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
    
    // Add event listeners to buttons
    document.querySelectorAll('.btn-adjust').forEach(btn => {
        btn.addEventListener('click', function() {
            const statKey = this.dataset.stat;
            const action = this.dataset.action;
            const change = action === 'increase' ? 1 : -1;
            adjustStat(statKey, change);
        });
    });
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

// Initialize class selector
function initClassSelector() {
    const classIconButton = document.getElementById('classIconButton');
    const classOptions = document.getElementById('classOptions');
    const optionElements = document.querySelectorAll('.class-option');
    let selectorOpen = false;
    
    // Toggle selector on icon click
    if (classIconButton) {
        classIconButton.addEventListener('click', function(e) {
            e.stopPropagation();
            selectorOpen = !selectorOpen;
            
            if (selectorOpen) {
                classOptions.classList.add('active');
                classIconButton.classList.add('active');
                
                // Hide current class option
                optionElements.forEach(option => {
                    if (option.dataset.class === currentClass) {
                        option.classList.add('hidden');
                    } else {
                        option.classList.remove('hidden');
                    }
                });
            } else {
                classOptions.classList.remove('active');
                classIconButton.classList.remove('active');
            }
        });
    }
    
    // Handle class selection
    optionElements.forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedClass = this.dataset.class;
            
            if (selectedClass !== currentClass) {
                // Change class
                currentClass = selectedClass;
                
                // Update URL
                const url = new URL(window.location);
                url.searchParams.set('class', selectedClass);
                window.history.replaceState({}, '', url);
                
                // Update class icon
                const classIcon = document.getElementById('classIcon');
                if (classIcon) {
                    classIcon.src = `../assets/images/icons/${currentClass}_icon.png`;
                    classIcon.alt = `${currentClass} icon`;
                }
                
                // Reset points when changing class
                resetPoints();
                
                // Re-render stats with new multipliers
                renderStats();
                updatePointsDisplay();
                
                // Close selector
                classOptions.classList.remove('active');
                classIconButton.classList.remove('active');
                selectorOpen = false;
            }
        });
        
        // Handle image errors
        const img = option.querySelector('img');
        if (img) {
            img.onerror = function() {
                this.style.display = 'none';
                this.parentElement.innerHTML = `
                    <div style="color: #666; font-size: 1.5rem;">⚔️</div>
                `;
            };
        }
    });
    
    // Close selector when clicking outside
    document.addEventListener('click', function(e) {
        if (selectorOpen && !classIconButton.contains(e.target) && !classOptions.contains(e.target)) {
            classOptions.classList.remove('active');
            classIconButton.classList.remove('active');
            selectorOpen = false;
        }
    });
}

// Initialize traits button
function initTraitsButton() {
    const traitsButton = document.getElementById('traitsButton');
    const traitsIcon = document.getElementById('traitsIcon');
    
    if (traitsButton) {
        traitsButton.addEventListener('click', function() {
            console.log('Traits clicked - Feature coming soon!');
            // Aqui você pode adicionar a funcionalidade de traits futuramente
            // Por exemplo: abrir um modal, navegar para outra página, etc.
            
            // Animação de feedback ao clicar
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    }
    
    // Tratamento de erro para o ícone de traits
    if (traitsIcon) {
        traitsIcon.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = `
                <div class="traits-icon-fallback">★</div>
                <span class="traits-coming-soon">SOON</span>
                <div class="traits-tooltip" data-i18n="stats.traits">Traits</div>
            `;
        };
    }
}

// Initialize
function init() {
    // Obtém classe da URL
    currentClass = getURLParameter('class') || 'knight';
    
    // Define o ícone da classe
    const classIcon = document.getElementById('classIcon');
    if (classIcon) {
        classIcon.src = `../assets/images/icons/${currentClass}_icon.png`;
        classIcon.alt = `${currentClass} icon`;
        
        // Tratamento de erro para ícone não encontrado
        classIcon.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = `
                <div style="color: #666; font-size: 2rem;">⚔️</div>
            `;
        };
    }
    
    // Inicializa componentes compartilhados
    createStars();
    initTranslations();
    initLanguageSelector(() => renderStats());
    
    // Inicializa componentes específicos
    initLevelInput();
    initClassSelector();
    initTraitsButton();
    renderStats();
    updatePointsDisplay();
    
    // Listener para mudança de idioma
    window.addEventListener('languageChanged', () => {
        renderStats();
    });
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Expõe globalmente para compatibilidade se necessário
window.renderStats = renderStats;
window.adjustStat = adjustStat;