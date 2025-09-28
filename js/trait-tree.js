// ======================
// TRAIT TREE - MAIN CONTROLLER
// ======================

import { createStars } from './modules/stars.js';
import { initTranslations, t } from './translations.js';
// Removido: import blackholeTransition - não usado nesta página
import { traitTrees, traitOrder, traitIndexMap } from './data/trait-trees-config.js';
import { SkillTreeRenderer } from './modules/skill-tree-renderer.js';
import { TreeNavigation } from './modules/tree-navigation.js';
import { skillInlineSystem } from './modules/skill-inline-system.js';  // Novo sistema inline

class TraitTreeController {
    constructor() {
        this.trees = traitTrees;
        this.currentTree = null;
        this.renderers = {};
        this.navigation = null;
        this.initialized = false;
        
        // Expõe o sistema inline globalmente para o renderer acessar
        window.skillInlineSystem = skillInlineSystem;
    }
    
    // Inicializa o sistema
    init() {
        if (this.initialized) return;
        
        // Componentes básicos
        createStars();
        initTranslations();
        
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
                // Não precisa mais de callback - usa sistema inline diretamente
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
                // Se estiver em zoom, sai primeiro
                if (document.body.classList.contains('skill-zoomed')) {
                    skillInlineSystem.exitZoom();
                } else {
                    // Navega para próxima skill
                    const skills = document.querySelectorAll('.skill-node');
                    const selected = document.querySelector('.skill-node.selected');
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
                
                console.log(`Árvore ${this.currentTree} resetada`);
            }
        }
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
    
    /* Dica de atalhos */
    .keyboard-hints {
        position: fixed;
        bottom: 8rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 2rem;
        font-size: 0.35rem;
        color: rgba(255, 255, 255, 0.3);
        font-family: 'Press Start 2P', cursive;
    }
    
    .keyboard-hint {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .key-badge {
        padding: 0.2rem 0.4rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }
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