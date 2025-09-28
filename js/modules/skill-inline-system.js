// ======================
// SKILL INLINE SYSTEM - Sem Modal
// ======================

import { t } from '../translations.js';

export class SkillInlineSystem {
    constructor() {
        this.selectedSkill = null;
        this.skillPoints = 30; // Pontos disponíveis para teste
        this.usedPoints = 0;
        this.init();
    }
    
    init() {
        this.createPointsDisplay();
        this.setupStyles();
    }
    
    // Cria display de pontos disponíveis
    createPointsDisplay() {
        const display = document.createElement('div');
        display.className = 'skill-points-display';
        display.id = 'skillPointsDisplay';
        display.innerHTML = `
            <span class="points-label">${t('tree.availablePoints')}</span>
            <span class="points-value">${this.skillPoints}</span>
        `;
        document.body.appendChild(display);
        
        this.updatePointsDisplay();
    }
    
    // Atualiza display de pontos
    updatePointsDisplay() {
        const display = document.querySelector('.points-value');
        if (display) {
            display.textContent = this.skillPoints - this.usedPoints;
        }
    }
    
    // Seleciona skill e mostra info
    selectSkill(skillNode, skillData, renderer) {
        this.selectedSkill = skillData;
        skillNode.classList.add('selected');
        
        // Faz zoom REAL centralizando a skill
        this.zoomToSkill(skillNode, skillData);
        
        // Cria upgrader em cima
        this.createUpgrader(skillNode, skillData, renderer);
        
        // Cria info embaixo
        this.createInfoInline(skillNode, skillData);
    }
    
    // Sistema de zoom centralizado
    zoomToSkill(skillNode, skillData) {
        const treeContent = skillNode.closest('.tree-content');
        if (!treeContent) return;
        
        // Pega posição atual da skill
        const rect = skillNode.getBoundingClientRect();
        const treeRect = treeContent.getBoundingClientRect();
        
        // Calcula posição relativa dentro da árvore
        const relativeX = (rect.left + rect.width/2 - treeRect.left) / treeRect.width;
        const relativeY = (rect.top + rect.height/2 - treeRect.top) / treeRect.height;
        
        // Adiciona classe de zoom
        treeContent.classList.add('zoomed-mode');
        document.body.classList.add('skill-zoomed');
        
        // Esconde elementos da UI
        this.hideUIElements();
        
        // Muda o título para o nome da skill
        this.updateTitle(skillData);
        
        // Aplica transformação para centralizar
        const scale = 2; // Zoom 2x
        const translateX = (50 - relativeX * 100) + '%';
        const translateY = (40 - relativeY * 100) + '%'; // 40% para dar espaço para info embaixo
        
        treeContent.style.transform = `translate(${translateX}, ${translateY}) scale(${scale})`;
        treeContent.style.transformOrigin = 'center center';
        
        // Adiciona botão de fechar zoom
        this.addCloseZoomButton();
    }
    
    // Sai do zoom
    exitZoom() {
        // Remove zoom
        const treeContent = document.querySelector('.tree-content.zoomed-mode');
        if (treeContent) {
            treeContent.classList.remove('zoomed-mode');
            treeContent.style.transform = '';
        }
        
        document.body.classList.remove('skill-zoomed');
        
        // Mostra elementos da UI novamente
        this.showUIElements();
        
        // Restaura título original
        this.restoreTitle();
        
        // Remove botão de fechar
        const closeBtn = document.querySelector('.zoom-close-btn');
        if (closeBtn) closeBtn.remove();
        
        // Remove seleção
        document.querySelectorAll('.skill-node.selected').forEach(node => {
            node.classList.remove('selected');
            const info = node.querySelector('.skill-info-inline');
            if (info) info.remove();
            const upgrader = node.querySelector('.skill-upgrader');
            if (upgrader) upgrader.remove();
        });
        
        this.selectedSkill = null;
    }
    
    // Esconde elementos da UI
    hideUIElements() {
        const elements = [
            '.keyboard-hints',
            '.nav-arrow',
            '.navigation-dots',
            '.scroll-hint',
            '.back-btn'
        ];
        
        elements.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.display = 'none';
        });
    }
    
    // Mostra elementos da UI
    showUIElements() {
        const elements = [
            '.keyboard-hints',
            '.nav-arrow',
            '.navigation-dots',
            '.scroll-hint',
            '.back-btn'
        ];
        
        elements.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.display = '';
        });
    }
    
    // Atualiza título para nome da skill
    updateTitle(skillData) {
        const titleElement = document.querySelector('.tree-title');
        if (titleElement) {
            this.originalTitle = titleElement.textContent;
            const skillName = t(`skill.${skillData.id}`) || skillData.name;
            titleElement.textContent = skillName;
            titleElement.classList.add('skill-title');
        }
    }
    
    // Restaura título original
    restoreTitle() {
        const titleElement = document.querySelector('.tree-title');
        if (titleElement && this.originalTitle) {
            titleElement.textContent = this.originalTitle;
            titleElement.classList.remove('skill-title');
        }
    }
    
    // Adiciona botão de fechar zoom
    addCloseZoomButton() {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'zoom-close-btn';
        closeBtn.innerHTML = `
            <span>✕</span>
            <span class="close-text">${t('tree.close') || 'Close'}</span>
        `;
        closeBtn.addEventListener('click', () => this.exitZoom());
        document.body.appendChild(closeBtn);
    }
    
    // Seleciona/Toggle skill - MODIFICADO
    toggleSkill(skillNode, skillData, renderer) {
        // Se está em modo zoom e clica em outra skill, sai do zoom primeiro
        if (document.body.classList.contains('skill-zoomed')) {
            const isSelected = skillNode.classList.contains('selected');
            
            if (isSelected) {
                // Se clica na mesma skill, tenta dar upgrade
                this.tryUpgrade(skillData, renderer);
            } else {
                // Se clica em outra skill, sai do zoom e seleciona a nova
                this.exitZoom();
                setTimeout(() => {
                    this.selectSkill(skillNode, skillData, renderer);
                }, 300);
            }
        } else {
            // Primeira seleção - faz zoom
            this.selectSkill(skillNode, skillData, renderer);
        }
    }
    
    // Cria controle de upgrade em cima da skill
    createUpgrader(skillNode, skillData, renderer) {
        const upgrader = document.createElement('div');
        upgrader.className = 'skill-upgrader';
        
        const canUpgrade = this.canUpgrade(skillData, renderer);
        const isMaxLevel = skillData.currentLevel >= skillData.maxLevel;
        
        if (isMaxLevel) {
            upgrader.innerHTML = `
                <div class="upgrade-max">${t('skill.maxLevel')}</div>
            `;
        } else if (canUpgrade) {
            upgrader.innerHTML = `
                <div class="upgrade-button" data-action="upgrade">
                    <span class="upgrade-icon">+</span>
                    <span class="upgrade-cost">1</span>
                </div>
            `;
            
            // Adiciona evento de clique
            const btn = upgrader.querySelector('.upgrade-button');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.tryUpgrade(skillData, renderer);
            });
        } else {
            // Mostra requisitos não atendidos
            upgrader.innerHTML = `
                <div class="upgrade-locked">
                    <span class="lock-icon">🔒</span>
                </div>
            `;
        }
        
        skillNode.appendChild(upgrader);
    }
    
    // Cria info inline embaixo da skill
    createInfoInline(skillNode, skillData) {
        const info = document.createElement('div');
        info.className = 'skill-info-inline';
        
        // Traduz textos
        const name = t(`skill.${skillData.id}`) || skillData.name;
        const desc = t(`skill.${skillData.id}.desc`) || skillData.description;
        const effect = t(`skill.${skillData.id}.effect`) || skillData.effect;
        
        // Cria HTML da info
        info.innerHTML = `
            <div class="info-name">${name}</div>
            <div class="info-level">
                ${skillData.currentLevel}/${skillData.maxLevel}
            </div>
            <div class="info-desc">${desc}</div>
            <div class="info-effect">${effect}</div>
            ${this.renderRequirements(skillData)}
            ${this.renderLevelReqs(skillData)}
        `;
        
        skillNode.appendChild(info);
    }
    
    // Renderiza requisitos
    renderRequirements(skillData) {
        if (!skillData.requires || skillData.requires.length === 0) return '';
        
        const reqList = skillData.requires.map(req => {
            const [skillId, level] = req.split(':');
            const skillName = t(`skill.${skillId}`) || skillId;
            return `${skillName} Lv.${level || 1}`;
        }).join(', ');
        
        return `
            <div class="info-requires">
                <span class="req-label">${t('skill.requires')}:</span>
                <span class="req-list">${reqList}</span>
            </div>
        `;
    }
    
    // Renderiza requisitos de nível
    renderLevelReqs(skillData) {
        if (typeof skillData.levelRequirements[0] !== 'number') {
            return `<div class="info-active-skill">${t('skill.active')}</div>`;
        }
        
        return `
            <div class="info-level-reqs">
                <span class="level-label">${t('skill.levelReq')}:</span>
                <span class="level-list">${skillData.levelRequirements.join(' / ')}</span>
            </div>
        `;
    }
    
    // Tenta dar upgrade na skill
    tryUpgrade(skillData, renderer) {
        if (!this.canUpgrade(skillData, renderer)) {
            // Feedback visual de bloqueado
            const node = document.querySelector(`[data-skill="${skillData.id}"]`);
            if (node) {
                node.classList.add('shake');
                setTimeout(() => node.classList.remove('shake'), 500);
            }
            return false;
        }
        
        // Faz o upgrade
        if (this.skillPoints - this.usedPoints > 0) {
            skillData.currentLevel++;
            this.usedPoints++;
            
            // Atualiza visual
            renderer.updateSkillLevel(skillData.id, skillData.currentLevel);
            
            // Atualiza display de pontos
            this.updatePointsDisplay();
            
            // Re-seleciona para atualizar info
            const node = document.querySelector(`[data-skill="${skillData.id}"]`);
            if (node) {
                // Remove info antiga
                const oldInfo = node.querySelector('.skill-info-inline');
                if (oldInfo) oldInfo.remove();
                const oldUpgrader = node.querySelector('.skill-upgrader');
                if (oldUpgrader) oldUpgrader.remove();
                
                // Recria com novos valores
                this.createUpgrader(node, skillData, renderer);
                this.createInfoInline(node, skillData);
                
                // Efeito visual de upgrade
                node.classList.add('upgrade-effect');
                setTimeout(() => node.classList.remove('upgrade-effect'), 600);
            }
            
            return true;
        }
        
        return false;
    }
    
    // Verifica se pode dar upgrade
    canUpgrade(skillData, renderer) {
        // Verifica se não está no máximo
        if (skillData.currentLevel >= skillData.maxLevel) return false;
        
        // Verifica se tem pontos
        if (this.skillPoints - this.usedPoints <= 0) return false;
        
        // Verifica requisitos
        return renderer.checkRequirements(skillData);
    }
    
    // Reseta pontos
    resetPoints() {
        this.usedPoints = 0;
        this.updatePointsDisplay();
    }
    
    // Define pontos totais
    setTotalPoints(points) {
        this.skillPoints = points;
        this.updatePointsDisplay();
    }
    
    // CSS do sistema inline
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Display de pontos */
            .skill-points-display {
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid rgba(255, 215, 0, 0.5);
                padding: 0.8rem 1.5rem;
                font-family: 'Press Start 2P', cursive;
                font-size: 0.7rem;
                color: #fff;
                z-index: 50;
                display: flex;
                gap: 1rem;
                align-items: center;
                transition: opacity 0.3s ease;
            }
            
            /* Esconde display durante zoom */
            .skill-zoomed .skill-points-display {
                opacity: 0;
                pointer-events: none;
            }
            
            .points-label {
                color: rgba(255, 255, 255, 0.7);
            }
            
            .points-value {
                color: #0f0;
                font-size: 0.9rem;
                text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
            }
            
            /* Modo zoom - CORRIGIDO */
            .tree-content.zoomed-mode {
                z-index: 100;
                position: relative;
            }
            
            .skill-constellation {
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
            }
            
            /* Semi-transparência no fundo durante zoom */
            .skill-zoomed::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6); /* Menos escuro para ver skills próximas */
                z-index: 40;
                animation: fadeIn 0.3s ease;
                pointer-events: none;
            }
            
            /* Skills próximas durante zoom */
            .skill-node.nearby {
                cursor: pointer !important;
                transition: all 0.3s ease;
            }
            
            .skill-node.nearby:hover {
                opacity: 1 !important;
                transform: translate(-50%, -50%) scale(1.1);
            }
            
            .skill-node.nearby:hover img {
                filter: brightness(1.1) drop-shadow(0 0 10px rgba(255, 255, 255, 0.6));
            }
            
            /* Skills de média distância */
            .skill-node.medium-distance {
                cursor: pointer !important;
                transition: all 0.3s ease;
            }
            
            .skill-node.medium-distance:hover {
                opacity: 0.6 !important;
            }
            
            /* Skills distantes */
            .skill-node.far-away {
                pointer-events: none !important;
                opacity: 0.1 !important;
            }
            
            /* Skill focada (centro do zoom) */
            .skill-node.focused {
                z-index: 120 !important;
            }
            
            .skill-node.focused img {
                filter: brightness(1.6) drop-shadow(0 0 40px rgba(255, 215, 0, 1)) !important;
                transform: translate(-50%, -50%) scale(1.4);
            }
            
            .skill-node.focused .skill-glow::before {
                animation: focusedPulse 1s ease-in-out infinite !important;
                transform: scale(3) !important;
            }
            
            @keyframes focusedPulse {
                0%, 100% {
                    opacity: 1;
                    filter: blur(3px);
                }
                50% {
                    opacity: 0.6;
                    filter: blur(5px);
                }
            }
            
            /* Navegação com opacidade reduzida */
            .skill-zoomed .nav-arrow,
            .skill-zoomed .navigation-dots,
            .skill-zoomed .scroll-hint,
            .skill-zoomed .keyboard-hints {
                opacity: 0.2 !important;
                pointer-events: none;
            }
            
            /* Título muda para nome da skill */
            .tree-title.skill-title {
                color: #ffd700 !important;
                font-size: 1.5rem !important;
                text-shadow: 
                    0 0 30px rgba(255, 215, 0, 0.8),
                    2px 2px 0 #333 !important;
                animation: titlePulse 2s ease-in-out infinite;
            }
            
            @keyframes titlePulse {
                0%, 100% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
            }
            
            /* Botão de fechar zoom */
            .zoom-close-btn {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid rgba(255, 255, 255, 0.5);
                color: #fff;
                padding: 0.8rem 1rem;
                font-family: 'Press Start 2P', cursive;
                font-size: 0.6rem;
                cursor: pointer;
                z-index: 150;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
                animation: fadeIn 0.3s ease;
            }
            
            .zoom-close-btn:hover {
                border-color: #fff;
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
                transform: scale(1.05);
            }
            
            .zoom-close-btn span:first-child {
                font-size: 1rem;
            }
            
            /* Skill selecionada */
            .skill-node.selected {
                z-index: 110 !important;
            }
            
            .skill-node.selected img {
                filter: brightness(1.5) drop-shadow(0 0 30px rgba(255, 215, 0, 1)) !important;
                transform: translate(-50%, -50%) scale(1.3);
            }
            
            .skill-node.selected .skill-glow::before {
                animation: selectedPulse 1s ease-in-out infinite !important;
                transform: scale(2.5) !important;
            }
            
            @keyframes selectedPulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.7;
                }
            }
            
            /* Upgrader em cima - ajustado para zoom */
            .skill-upgrader {
                position: absolute;
                top: -45px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 115;
                animation: fadeInUp 0.3s ease;
            }
            
            .zoomed-mode .skill-upgrader {
                top: -30px;
                transform: translateX(-50%) scale(0.7);
            }
            
            .upgrade-button {
                background: rgba(0, 255, 0, 0.2);
                border: 2px solid rgba(0, 255, 0, 0.8);
                padding: 0.4rem 0.6rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.3rem;
                transition: all 0.2s ease;
                font-family: 'Press Start 2P', cursive;
            }
            
            .upgrade-button:hover {
                background: rgba(0, 255, 0, 0.4);
                border-color: #0f0;
                box-shadow: 0 0 15px rgba(0, 255, 0, 1);
                transform: scale(1.1);
            }
            
            .upgrade-icon {
                color: #0f0;
                font-size: 1rem;
                font-weight: bold;
            }
            
            .upgrade-cost {
                color: #fff;
                font-size: 0.5rem;
            }
            
            .upgrade-locked {
                padding: 0.4rem;
                opacity: 0.5;
            }
            
            .lock-icon {
                font-size: 1rem;
            }
            
            .upgrade-max {
                color: #ffd700;
                font-size: 0.4rem;
                padding: 0.3rem 0.5rem;
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                font-family: 'Press Start 2P', cursive;
            }
            
            /* Info inline embaixo - ajustado para zoom */
            .skill-info-inline {
                position: absolute;
                top: calc(100% + 40px);
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.98);
                border: 2px solid rgba(255, 215, 0, 0.6);
                padding: 1rem;
                min-width: 280px;
                max-width: 350px;
                z-index: 125; /* Acima de tudo durante zoom */
                font-family: 'Press Start 2P', cursive;
                animation: fadeInDown 0.3s ease;
                box-shadow: 
                    0 10px 30px rgba(0, 0, 0, 0.9),
                    0 0 20px rgba(255, 215, 0, 0.3);
            }
            
            /* Durante zoom, ajusta escala da info */
            .zoomed-mode .skill-info-inline {
                transform: translateX(-50%) scale(0.8);
                transform-origin: top center;
            }
            
            /* Indicador de navegação durante zoom */
            .skill-node.nearby::after {
                content: '→';
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                color: rgba(255, 255, 255, 0.6);
                font-size: 1rem;
                animation: floatArrow 2s ease-in-out infinite;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .skill-zoomed .skill-node.nearby::after {
                opacity: 1;
            }
            
            .skill-node.nearby:hover::after {
                color: #ffd700;
                animation-duration: 0.5s;
            }
            
            @keyframes floatArrow {
                0%, 100% { transform: translateX(-50%) translateY(0); }
                50% { transform: translateX(-50%) translateY(-5px); }
            }
            
            .info-name {
                color: #ffd700;
                font-size: 0.7rem;
                margin-bottom: 0.4rem;
                text-transform: uppercase;
                text-align: center;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
            }
            
            .info-level {
                color: #0f0;
                font-size: 0.6rem;
                text-align: center;
                margin-bottom: 0.6rem;
                text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
            }
            
            .info-desc {
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.45rem;
                line-height: 1.6;
                margin-bottom: 0.5rem;
            }
            
            .info-effect {
                color: rgba(0, 255, 255, 0.9);
                font-size: 0.45rem;
                margin-bottom: 0.5rem;
                padding-top: 0.4rem;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .info-requires {
                color: rgba(255, 100, 100, 0.9);
                font-size: 0.4rem;
                margin-bottom: 0.4rem;
            }
            
            .info-level-reqs {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.4rem;
            }
            
            .info-active-skill {
                color: #ffd700;
                font-size: 0.45rem;
                text-align: center;
                padding: 0.4rem;
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                margin-top: 0.4rem;
            }
            
            .req-label, .level-label {
                color: rgba(255, 255, 255, 0.6);
                margin-right: 0.4rem;
            }
            
            /* Animações */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            @keyframes fadeInDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            /* Efeito de shake */
            .skill-node.shake {
                animation: shake 0.5s ease;
            }
            
            @keyframes shake {
                0%, 100% { transform: translate(-50%, -50%) translateX(0); }
                25% { transform: translate(-50%, -50%) translateX(-5px); }
                75% { transform: translate(-50%, -50%) translateX(5px); }
            }
            
            /* Efeito de upgrade */
            .skill-node.upgrade-effect {
                animation: upgradeFlash 0.6s ease;
            }
            
            @keyframes upgradeFlash {
                0% { filter: brightness(1); }
                50% { 
                    filter: brightness(2) drop-shadow(0 0 40px rgba(0, 255, 0, 1));
                    transform: translate(-50%, -50%) scale(1.4);
                }
                100% { filter: brightness(1); }
            }
            
            /* Previne scroll durante zoom */
            body.skill-zoomed {
                overflow: hidden;
            }
            
            /* Responsivo */
            @media (max-width: 768px) {
                .skill-points-display {
                    top: 60px;
                    font-size: 0.6rem;
                    padding: 0.6rem 1rem;
                }
                
                .skill-info-inline {
                    min-width: 230px;
                    max-width: 280px;
                    padding: 0.8rem;
                }
                
                .zoomed-mode .skill-info-inline {
                    transform: translateX(-50%) scale(0.6);
                }
                
                .info-name { font-size: 0.6rem; }
                .info-desc, .info-effect { font-size: 0.4rem; }
                .info-requires, .info-level-reqs { font-size: 0.35rem; }
                
                .zoom-close-btn {
                    padding: 0.6rem 0.8rem;
                    font-size: 0.5rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Exporta instância singleton
export const skillInlineSystem = new SkillInlineSystem();