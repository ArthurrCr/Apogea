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
        // NÃO cria display de pontos - agora está no header do trait-tree
        this.setupStyles();
    }
    
    // Atualiza display de pontos (agora no header)
    updatePointsDisplay() {
        const display = document.querySelector('#availablePoints');
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
    
    // Sistema de zoom centralizado - CORRIGIDO COM OFFSET
    zoomToSkill(skillNode, skillData) {
        const treeContent = skillNode.closest('.tree-content');
        if (!treeContent) return;
        
        // Adiciona classes de zoom
        document.body.classList.add('skill-zoomed');
        skillNode.classList.add('zoomed');
        
        // Esconde elementos da UI
        this.hideUIElements();
        
        // Muda o título para o nome da skill
        this.updateTitle(skillData);
        
        // Remove qualquer transform existente primeiro para obter posição real
        const currentTransform = treeContent.style.transform;
        treeContent.style.transform = '';
        
        // Aguarda um frame para o browser recalcular
        requestAnimationFrame(() => {
            // Pega a posição real da skill
            const rect = skillNode.getBoundingClientRect();
            const treeRect = treeContent.getBoundingClientRect();
            
            // Centro da tela
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            // Centro da skill
            const skillCenterX = rect.left + rect.width / 2;
            const skillCenterY = rect.top + rect.height / 2;
            
            // Calcula quanto precisa mover
            const moveX = centerX - skillCenterX;
            const moveY = centerY - skillCenterY;
            
            // Aplica movimento suave
            treeContent.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            treeContent.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        });
        
        // Adiciona botão de fechar zoom
        this.addCloseZoomButton();
    }
    
    // Sai do zoom
    exitZoom() {
        const treeContent = document.querySelector('.tree-content');
        if (treeContent) {
            treeContent.style.transform = 'translate(-50%, -50%)';
            treeContent.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }
        
        document.body.classList.remove('skill-zoomed');
        
        // Remove classe zoomed de todas as skills
        document.querySelectorAll('.skill-node.zoomed').forEach(node => {
            node.classList.remove('zoomed');
        });
        
        // Mostra elementos da UI novamente
        this.showUIElements();
        
        // Restaura título original
        this.restoreTitle();
        
        // Remove botão de fechar
        const closeBtn = document.querySelector('.zoom-close-btn');
        if (closeBtn) closeBtn.remove();
        
        // Remove dicas de teclado
        const hints = document.querySelector('.zoom-keyboard-hints');
        if (hints) hints.remove();
        
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
    
    // Esconde elementos da UI (NÃO esconde o título!)
    hideUIElements() {
        const elements = [
            '.nav-arrow',
            '.navigation-dots',
            '.scroll-hint',
            '.back-btn',
            '.tree-header'
        ];
        
        elements.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.display = 'none';
        });
    }
    
    // Mostra elementos da UI
    showUIElements() {
        const elements = [
            '.nav-arrow',
            '.navigation-dots',
            '.scroll-hint',
            '.back-btn'
        ];
        
        elements.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) el.style.display = '';
        });
        
        // Tree header precisa ser flex
        const header = document.querySelector('.tree-header');
        if (header) header.style.display = 'flex';
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
        
        // Adiciona dicas de teclado durante zoom
        this.addZoomKeyboardHints();
    }
    
    // Adiciona dicas de teclado durante zoom
    addZoomKeyboardHints() {
        const hints = document.createElement('div');
        hints.className = 'zoom-keyboard-hints';
        hints.innerHTML = `
            <div class="zoom-hint">
                <span class="zoom-key">W/S ↑↓</span>
                <span>${t('tree.levelUpDown') || 'Level Up/Down'}</span>
            </div>
            <div class="zoom-hint">
                <span class="zoom-key">Space</span>
                <span>${t('tree.selectUpgrade') || 'Upgrade'}</span>
            </div>
            <div class="zoom-hint">
                <span class="zoom-key">Tab</span>
                <span>${t('tree.selectNext') || 'Next Skill'}</span>
            </div>
            <div class="zoom-hint">
                <span class="zoom-key">ESC</span>
                <span>${t('tree.close') || 'Close'}</span>
            </div>
        `;
        document.body.appendChild(hints);
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
                <div class="upgrade-max">${t('skill.maxLevel') || 'MAX'}</div>
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
    
    // Cria info inline embaixo da skill (SEM nome e contagem)
    createInfoInline(skillNode, skillData) {
        const info = document.createElement('div');
        info.className = 'skill-info-inline';
        
        // Traduz textos
        const desc = t(`skill.${skillData.id}.desc`) || skillData.description;
        const effect = t(`skill.${skillData.id}.effect`) || skillData.effect;
        
        // Cria HTML da info (SEM info-name e info-level)
        info.innerHTML = `
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
                <span class="req-label">${t('skill.requires') || 'Requires'}:</span>
                <span class="req-list">${reqList}</span>
            </div>
        `;
    }
    
    // Renderiza requisitos de nível (agora Level Bonus com cores)
    renderLevelReqs(skillData) {
        if (typeof skillData.levelRequirements[0] !== 'number') {
            return `<div class="info-active-skill">${t('skill.active') || 'Active Skill'}</div>`;
        }
        
        // Renderiza cada número com cor baseada no nível atual
        const bonusList = skillData.levelRequirements.map((levelReq, index) => {
            const isActive = index < skillData.currentLevel;
            const colorClass = isActive ? 'bonus-active' : 'bonus-inactive';
            return `<span class="${colorClass}">${levelReq}</span>`;
        }).join(' / ');
        
        return `
            <div class="info-level-reqs">
                <span class="level-label">${t('skill.levelBonus') || 'Level Bonus'}:</span>
                <span class="level-list">${bonusList}</span>
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
            
            // Dispara evento para o controller atualizar também
            window.dispatchEvent(new CustomEvent('pointsChanged'));
            
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
        
        // Dispara evento para o controller atualizar também
        window.dispatchEvent(new CustomEvent('pointsChanged'));
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
            /* Modo zoom - CORRIGIDO */
            .tree-content {
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            /* Skill em zoom (bolinha MENOR para caber descrição) */
            .skill-node.zoomed {
                z-index: 110 !important;
                transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .skill-node.zoomed img {
                filter: brightness(1.8) drop-shadow(0 0 40px rgba(255, 215, 0, 1)) !important;
                transform: translate(-50%, -50%) scale(1.5); /* Reduzido de 2.5 para 1.5 */
                transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            
            .skill-node.zoomed .skill-glow::before {
                animation: zoomedPulse 1s ease-in-out infinite !important;
                transform: scale(2.5) !important; /* Reduzido de 4 para 2.5 */
            }
            
            @keyframes zoomedPulse {
                0%, 100% {
                    opacity: 1;
                    filter: blur(5px);
                }
                50% {
                    opacity: 0.7;
                    filter: blur(8px);
                }
            }
            
            /* Escurece outras skills durante zoom */
            .skill-zoomed .skill-node:not(.zoomed):not(.selected) {
                opacity: 0.2;
                filter: grayscale(0.8);
                transition: opacity 0.3s ease, filter 0.3s ease;
            }
            
            /* Linhas ficam mais discretas durante zoom */
            .skill-zoomed .constellation-lines {
                opacity: 0.2;
                transition: opacity 0.3s ease;
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
            
            /* Dicas de teclado durante zoom - COLUNA ESQUERDA */
            .zoom-keyboard-hints {
                position: fixed;
                bottom: 2rem;
                left: 2rem;
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
                background: rgba(0, 0, 0, 0.9);
                padding: 1rem;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 4px;
                z-index: 150;
                animation: fadeInLeft 0.3s ease;
            }
            
            .zoom-hint {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-family: 'Press Start 2P', cursive;
                font-size: 0.35rem;
                color: rgba(255, 255, 255, 0.7);
            }
            
            .zoom-key {
                padding: 0.3rem 0.6rem;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.3);
                color: #fff;
                font-size: 0.4rem;
                border-radius: 2px;
                min-width: 70px;
                text-align: center;
            }
            
            @keyframes fadeInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            /* Upgrader em cima - REDUZIDO */
            .skill-upgrader {
                position: absolute;
                top: -60px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 115;
                animation: fadeInUp 0.3s ease;
            }
            
            /* Durante zoom, ajusta posição do upgrader - MENOR */
            .skill-node.zoomed .skill-upgrader {
                top: -70px;
                transform: translateX(-50%) scale(0.9); /* Reduzido de 1.5 para 0.9 */
            }
            
            .upgrade-button {
                background: rgba(0, 255, 0, 0.2);
                border: 2px solid rgba(0, 255, 0, 0.8);
                padding: 0.4rem 0.5rem; /* Reduzido padding */
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 0.3rem; /* Reduzido gap */
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
                font-size: 1rem; /* Reduzido de 1.2rem */
                font-weight: bold;
            }
            
            .upgrade-cost {
                color: #fff;
                font-size: 0.5rem; /* Reduzido de 0.6rem */
            }
            
            .upgrade-locked {
                padding: 0.4rem; /* Reduzido */
                opacity: 0.5;
            }
            
            .lock-icon {
                font-size: 1rem; /* Reduzido de 1.2rem */
            }
            
            .upgrade-max {
                color: #ffd700;
                font-size: 0.45rem; /* Reduzido de 0.5rem */
                padding: 0.3rem 0.5rem; /* Reduzido padding */
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                font-family: 'Press Start 2P', cursive;
                white-space: nowrap;
            }
            
            /* Info inline embaixo - AINDA MAIS PRÓXIMA */
            .skill-info-inline {
                position: absolute;
                top: calc(100% + 20px); /* Reduzido de 30px para 20px */
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.98);
                border: 2px solid rgba(255, 215, 0, 0.6);
                padding: 1rem;
                min-width: 320px;
                max-width: 400px;
                z-index: 125;
                font-family: 'Press Start 2P', cursive;
                animation: fadeInDown 0.3s ease;
                box-shadow: 
                    0 10px 30px rgba(0, 0, 0, 0.9),
                    0 0 20px rgba(255, 215, 0, 0.3);
            }
            
            /* Durante zoom, bem próxima */
            .skill-node.zoomed .skill-info-inline {
                top: calc(100% + 25px); /* Reduzido de 40px para 25px */
                transform: translateX(-50%) scale(1);
            }
            
            /* Esconde o nome da skill durante zoom */
            .skill-node.zoomed .skill-name {
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            /* Removidos: .info-name e .info-level (não são mais usados) */
            
            .info-desc {
                color: rgba(255, 255, 255, 0.9);
                font-size: 0.5rem;
                line-height: 1.6;
                margin-bottom: 0.6rem;
            }
            
            .info-effect {
                color: rgba(0, 255, 255, 0.9);
                font-size: 0.5rem;
                margin-bottom: 0.6rem;
                padding-top: 0.5rem;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .info-requires {
                color: rgba(255, 100, 100, 0.9);
                font-size: 0.45rem;
                margin-bottom: 0.5rem;
            }
            
            .info-level-reqs {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.45rem;
            }
            
            /* Bônus de nível - cores dinâmicas */
            .bonus-active {
                color: #0f0;
                text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
                font-weight: bold;
            }
            
            .bonus-inactive {
                color: rgba(255, 255, 255, 0.4);
            }
            
            .info-active-skill {
                color: #ffd700;
                font-size: 0.5rem;
                text-align: center;
                padding: 0.5rem;
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                margin-top: 0.5rem;
            }
            
            .req-label, .level-label {
                color: rgba(255, 255, 255, 0.6);
                margin-right: 0.5rem;
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
                .skill-info-inline {
                    min-width: 260px;
                    max-width: 320px;
                    padding: 0.8rem;
                }
                
                .info-desc, .info-effect { font-size: 0.45rem; }
                .info-requires, .info-level-reqs { font-size: 0.4rem; }
                
                .zoom-close-btn {
                    padding: 0.6rem 0.8rem;
                    font-size: 0.5rem;
                }
                
                .zoom-keyboard-hints {
                    bottom: 1rem;
                    left: 1rem;
                    gap: 0.6rem;
                    padding: 0.8rem;
                }
                
                .zoom-hint {
                    font-size: 0.3rem;
                }
                
                .zoom-key {
                    font-size: 0.35rem;
                    padding: 0.2rem 0.4rem;
                    min-width: 60px;
                }
                
                .upgrade-button {
                    padding: 0.4rem 0.6rem;
                }
                
                .upgrade-icon {
                    font-size: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Exporta instância singleton
export const skillInlineSystem = new SkillInlineSystem();