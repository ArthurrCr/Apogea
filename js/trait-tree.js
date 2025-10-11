// ======================
// TRAIT TREE - MAIN CONTROLLER
// ======================

import { createStars } from './modules/stars.js';
import { initTranslations, t } from './translations.js';
import { traitTrees, traitOrder, traitIndexMap } from './data/trait-trees-config.js';
import { SkillTreeRenderer } from './modules/skill-tree-renderer.js';
import { TreeNavigation } from './modules/tree-navigation.js';
import { skillInlineSystem } from './modules/skill-inline-system.js';

class TraitTreeController {
    constructor() {
        this.trees = traitTrees;
        this.currentTree = null;
        this.renderers = {};
        this.navigation = null;
        this.initialized = false;
        this.currentLevel = 1;
        this.totalPoints = 0;
        this.maxLevelForPoints = 80; // Nível máximo para ganhar pontos
        
        // Expõe o sistema inline globalmente para o renderer acessar
        window.skillInlineSystem = skillInlineSystem;
    }
    
    // Calcula pontos baseado no nível (1 ponto a cada 2 níveis)
    // Limitado ao nível 80 (máximo 40 pontos)
    calculatePointsFromLevel(level) {
        const cappedLevel = Math.min(level, this.maxLevelForPoints);
        return Math.floor(cappedLevel / 2);
    }
    
    // Atualiza display de pontos
    updatePointsDisplay() {
        this.totalPoints = this.calculatePointsFromLevel(this.currentLevel);
        skillInlineSystem.setTotalPoints(this.totalPoints);
        
        const pointsElement = document.getElementById('availablePoints');
        if (pointsElement) {
            const usedPoints = skillInlineSystem.usedPoints;
            const availablePoints = this.totalPoints - usedPoints;
            pointsElement.textContent = availablePoints;
            
            // Visual feedback baseado no estado dos pontos
            if (availablePoints < 0) {
                // Pontos negativos - ERRO (vermelho)
                pointsElement.style.color = '#ff0000';
                pointsElement.style.textShadow = '0 0 10px rgba(255, 0, 0, 0.8)';
                pointsElement.title = 'Insufficient points! Reduce level or reset skills.';
            } else if (this.currentLevel > this.maxLevelForPoints) {
                // Cap atingido (laranja)
                pointsElement.style.color = '#ffa500';
                pointsElement.style.textShadow = '0 0 10px rgba(255, 165, 0, 0.5)';
                pointsElement.title = `Maximum points reached at level ${this.maxLevelForPoints}`;
            } else {
                // Normal (verde)
                pointsElement.style.color = '#0f0';
                pointsElement.style.textShadow = '0 0 10px rgba(0, 255, 0, 0.5)';
                pointsElement.title = '';
            }
        }
    }
    
    // Inicializa input de level
    initLevelInput() {
        const levelInput = document.getElementById('levelInput');
        if (levelInput) {
            levelInput.addEventListener('input', () => {
                const newLevel = Math.max(1, Math.min(100, parseInt(levelInput.value) || 1));
                if (newLevel !== this.currentLevel) {
                    const oldLevel = this.currentLevel;
                    const newTotalPoints = this.calculatePointsFromLevel(newLevel);
                    const usedPoints = skillInlineSystem.usedPoints;
                    
                    // Verifica se a mudança resultaria em pontos negativos
                    if (newTotalPoints < usedPoints) {
                        const deficit = usedPoints - newTotalPoints;
                        const confirmReset = confirm(
                            `Changing to level ${newLevel} would result in ${deficit} insufficient points.\n\n` +
                            `Current: ${usedPoints} points used\n` +
                            `New total: ${newTotalPoints} points\n\n` +
                            `Do you want to reset all skills?`
                        );
                        
                        if (confirmReset) {
                            // Reseta todas as árvores
                            this.resetAllTrees();
                            this.currentLevel = newLevel;
                            levelInput.value = newLevel;
                            this.updatePointsDisplay();
                        } else {
                            // Cancela a mudança, volta ao level anterior
                            levelInput.value = oldLevel;
                            return;
                        }
                    } else {
                        // Mudança permitida
                        this.currentLevel = newLevel;
                        levelInput.value = newLevel;
                        this.updatePointsDisplay();
                        
                        // Mostra aviso se passou do cap
                        if (newLevel > this.maxLevelForPoints) {
                            console.log(`Level ${newLevel}: Points capped at level ${this.maxLevelForPoints} (${this.totalPoints} points)`);
                        }
                    }
                }
            });
        }
    }
    
    // Inicializa o sistema
    init() {
        if (this.initialized) return;
        
        // Componentes básicos
        createStars();
        initTranslations();
        
        // Inicializa level input
        this.initLevelInput();
        this.updatePointsDisplay();
        
        // Cria containers das árvores
        this.createTreeContainers();
        
        // Inicializa navegação
        this.navigation = new TreeNavigation('#treesContainer', traitOrder.length);
        this.navigation.onNavigate((index) => this.onTreeChange(index));
        
        // Renderiza todas as árvores
        this.renderAllTrees();
        
        // Configura eventos
        this.setupEventListeners();
        
        // Verifica parâmetros da URL
        this.checkURLParams();
        
        this.initialized = true;
    }
    
    // Cria os containers HTML para cada árvore
    createTreeContainers() {
        const container = document.getElementById('treesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        traitOrder.forEach(traitKey => {
            const tree = this.trees[traitKey];
            const panel = document.createElement('div');
            panel.className = 'tree-panel';
            panel.dataset.trait = traitKey;
            
            panel.innerHTML = `
                <h2 class="tree-title" data-i18n="trait.${traitKey}">
                    ${t(`trait.${traitKey}`)}
                </h2>
                <div class="tree-content" id="tree-${traitKey}">
                    <!-- Árvore será renderizada aqui -->
                </div>
            `;
            
            container.appendChild(panel);
        });
    }
    
    // Renderiza todas as árvores
    renderAllTrees() {
        traitOrder.forEach(traitKey => {
            const tree = this.trees[traitKey];
            const container = document.getElementById(`tree-${traitKey}`);
            
            if (container && tree.skills && Object.keys(tree.skills).length > 0) {
                // Cria renderer para esta árvore
                const renderer = new SkillTreeRenderer(container, tree);
                renderer.render();
                
                this.renderers[traitKey] = renderer;
            } else if (container) {
                // Placeholder para árvores não implementadas
                container.innerHTML = `
                    <div class="tree-placeholder">
                        <img src="${tree.icon}" alt="${tree.name}" 
                             onerror="this.style.display='none'">
                        <p class="coming-soon" data-i18n="tree.comingSoon">
                            ${t('tree.comingSoon')}
                        </p>
                    </div>
                `;
            }
        });
    }
    
    // Callback quando muda de árvore
    onTreeChange(index) {
        const currentTreeKey = traitOrder[index];
        this.currentTree = currentTreeKey;
        
        // Atualiza título da página
        document.title = `APOGEA - ${this.trees[currentTreeKey].name} Tree`;
        
        // Dispara evento customizado
        window.dispatchEvent(new CustomEvent('treeChanged', { 
            detail: { tree: currentTreeKey, index: index }
        }));
        
        console.log(`Árvore ativa: ${currentTreeKey}`);
    }
    
    // Configura eventos
    setupEventListeners() {
        // Botão de voltar - SEM BLACKHOLE, navegação direta
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Prepara URL de retorno
                let returnUrl = '../pages/traits.html';
                const urlParams = new URLSearchParams(window.location.search);
                const fromClass = urlParams.get('class');
                
                if (fromClass) {
                    returnUrl += `?from=stats&class=${fromClass}`;
                }
                
                // Navegação direta, sem transição
                window.location.href = returnUrl;
            });
        }
        
        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            // ESC para sair do zoom
            if (e.key === 'Escape' && document.body.classList.contains('skill-zoomed')) {
                e.preventDefault();
                skillInlineSystem.exitZoom();
            }
            
            // Tab para navegar entre skills
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                
                const skills = document.querySelectorAll('.skill-node');
                const selected = document.querySelector('.skill-node.selected');
                
                if (document.body.classList.contains('skill-zoomed')) {
                    // Se já está em zoom, vai para a próxima skill
                    if (selected) {
                        const index = Array.from(skills).indexOf(selected);
                        const nextIndex = (index + 1) % skills.length;
                        
                        // Sai do zoom e seleciona a próxima
                        skillInlineSystem.exitZoom();
                        setTimeout(() => {
                            skills[nextIndex].click();
                        }, 300);
                    }
                } else {
                    // Se não está em zoom, navega normalmente
                    if (selected) {
                        const index = Array.from(skills).indexOf(selected);
                        const nextIndex = (index + 1) % skills.length;
                        skills[nextIndex].click();
                    } else if (skills.length > 0) {
                        skills[0].click();
                    }
                }
            }
            
            // Espaço para dar upgrade quando em zoom
            if (e.key === ' ' && document.body.classList.contains('skill-zoomed')) {
                e.preventDefault();
                const upgradeBtn = document.querySelector('.upgrade-button');
                if (upgradeBtn) upgradeBtn.click();
            }
        });
        
        // Atalho R para resetar árvore atual
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.resetCurrentTree();
            }
        });
        
        // Listener para mudança de idioma
        window.addEventListener('languageChanged', () => {
            // Re-renderiza os títulos das árvores
            traitOrder.forEach(traitKey => {
                const titleElement = document.querySelector(`.tree-panel[data-trait="${traitKey}"] .tree-title`);
                if (titleElement) {
                    titleElement.textContent = t(`trait.${traitKey}`);
                }
            });
            
            // Re-renderiza as skills atuais
            this.renderAllTrees();
            
            // Atualiza o sistema inline
            const pointsLabel = document.querySelector('.points-label');
            if (pointsLabel) {
                pointsLabel.textContent = t('tree.availablePoints');
            }
        });
        
        // Listener para quando pontos forem usados
        window.addEventListener('pointsChanged', () => {
            this.updatePointsDisplay();
        });
    }
    
    // Verifica parâmetros da URL
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const trait = urlParams.get('trait');
        
        if (trait && traitIndexMap.hasOwnProperty(trait)) {
            const targetIndex = traitIndexMap[trait];
            
            // Navega para a árvore específica após um pequeno delay
            setTimeout(() => {
                this.navigation.goTo(targetIndex);
            }, 100);
        }
    }
    
    // Reseta árvore atual
    resetCurrentTree() {
        const currentRenderer = this.renderers[this.currentTree];
        if (currentRenderer) {
            if (confirm(t('tree.confirmReset') || 'Reset all skills in this tree?')) {
                currentRenderer.reset();
                // Reseta pontos no sistema inline
                skillInlineSystem.resetPoints();
                
                // Remove seleções visuais
                document.querySelectorAll('.skill-node.selected').forEach(node => {
                    node.classList.remove('selected');
                    const info = node.querySelector('.skill-info-inline');
                    if (info) info.remove();
                    const upgrader = node.querySelector('.skill-upgrader');
                    if (upgrader) upgrader.remove();
                });
                
                this.updatePointsDisplay();
                console.log(`Árvore ${this.currentTree} resetada`);
            }
        }
    }
    
    // Reseta todas as árvores
    resetAllTrees() {
        Object.keys(this.renderers).forEach(treeKey => {
            const renderer = this.renderers[treeKey];
            if (renderer) {
                renderer.reset();
            }
        });
        
        // Reseta pontos no sistema inline
        skillInlineSystem.resetPoints();
        
        // Remove seleções visuais
        document.querySelectorAll('.skill-node.selected').forEach(node => {
            node.classList.remove('selected');
            const info = node.querySelector('.skill-info-inline');
            if (info) info.remove();
            const upgrader = node.querySelector('.skill-upgrader');
            if (upgrader) upgrader.remove();
        });
        
        this.updatePointsDisplay();
        console.log('Todas as árvores resetadas');
    }
    
    // Métodos de utilidade
    getSkillPoints(treeKey) {
        // Calcular pontos gastos na árvore
        const tree = this.trees[treeKey];
        let points = 0;
        
        Object.values(tree.skills).forEach(skill => {
            points += skill.currentLevel;
        });
        
        return points;
    }
    
    exportTreeData(treeKey) {
        const tree = this.trees[treeKey];
        const data = {
            tree: treeKey,
            skills: {}
        };
        
        Object.entries(tree.skills).forEach(([key, skill]) => {
            if (skill.currentLevel > 0) {
                data.skills[key] = skill.currentLevel;
            }
        });
        
        return data;
    }
    
    importTreeData(data) {
        if (!data.tree || !this.trees[data.tree]) return false;
        
        const tree = this.trees[data.tree];
        const renderer = this.renderers[data.tree];
        
        if (!renderer) return false;
        
        // Reseta primeiro
        renderer.reset();
        
        // Aplica os níveis
        Object.entries(data.skills).forEach(([skillId, level]) => {
            if (tree.skills[skillId]) {
                renderer.updateSkillLevel(skillId, level);
            }
        });
        
        return true;
    }
}

// CSS adicional para placeholders
const style = document.createElement('style');
style.textContent = `
    .tree-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        gap: 2rem;
    }
    
    .tree-placeholder img {
        width: 100px;
        height: 100px;
        opacity: 0.3;
        filter: grayscale(1);
        image-rendering: pixelated;
    }
    
    .tree-placeholder .coming-soon {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.4);
        font-family: 'Press Start 2P', cursive;
        text-align: center;
        animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.7; }
    }
    
    /* Dica de atalhos - agora no trait-tree.css */
`;
document.head.appendChild(style);

// Inicializa quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const controller = new TraitTreeController();
    controller.init();
    
    // Exporta para uso global se necessário
    window.traitTreeController = controller;
});

// Exporta classe para uso em outros módulos se necessário
export { TraitTreeController };