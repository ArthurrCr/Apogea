// ======================
// SKILL INLINE SYSTEM - OTIMIZADO
// ======================

import { t } from '../translations.js';

export class SkillInlineSystem {
    constructor() {
        this.selectedSkill = null;
        this.selectedNode = null;
        this.selectedRenderer = null;
        this.skillPoints = 30;
        this.usedPoints = 0;
        
        // Cache de elementos
        this.cachedElements = {
            pointsDisplay: null,
            treeTitle: null,
            closeButton: null,
            keyboardHints: null
        };
        
        // Controle de transições
        this.isTransitioning = false;
        this.pendingTimeouts = [];
        this.rafIds = [];
        
        // Debounce para refresh
        this.refreshDebounceTimer = null;
        
        // RAF para atualização do upgrader
        this.upgraderUpdateRAF = null;
        
        // Throttle para upgrades (evita spam)
        this.lastUpgradeTime = 0;
        this.upgradeThrottle = 60; // ms entre upgrades (reduzido de 80ms para 60ms)
        
        // Batch updates
        this.pendingUpdates = new Set();
        this.batchUpdateRAF = null;
        
        this.init();
    }
    
    init() {
        this.setupStyles();
        this.setupEventListeners();
        this.cacheElements();
    }
    
    // Cacheia elementos frequentemente acessados
    cacheElements() {
        this.cachedElements.pointsDisplay = document.getElementById('availablePoints');
        this.cachedElements.treeTitle = document.querySelector('.tree-title');
    }
    
    // Limpa todos os timeouts/rafs pendentes
    clearPending() {
        this.pendingTimeouts.forEach(id => clearTimeout(id));
        this.rafIds.forEach(id => cancelAnimationFrame(id));
        this.pendingTimeouts = [];
        this.rafIds = [];
        
        // Cancela refresh debounce
        if (this.refreshDebounceTimer) {
            clearTimeout(this.refreshDebounceTimer);
            this.refreshDebounceTimer = null;
        }
        
        // Cancela atualização de upgrader
        if (this.upgraderUpdateRAF) {
            cancelAnimationFrame(this.upgraderUpdateRAF);
            this.upgraderUpdateRAF = null;
        }
        
        // Cancela batch update
        if (this.batchUpdateRAF) {
            cancelAnimationFrame(this.batchUpdateRAF);
            this.batchUpdateRAF = null;
        }
        
        // Limpa fila de updates pendentes
        this.pendingUpdates.clear();
    }
    
    // Adiciona timeout rastreável
    addTimeout(callback, delay) {
        const id = setTimeout(() => {
            callback();
            this.pendingTimeouts = this.pendingTimeouts.filter(t => t !== id);
        }, delay);
        this.pendingTimeouts.push(id);
        return id;
    }
    
    // Adiciona RAF rastreável
    addRAF(callback) {
        const id = requestAnimationFrame(() => {
            callback();
            this.rafIds = this.rafIds.filter(r => r !== id);
        });
        this.rafIds.push(id);
        return id;
    }
    
    setupEventListeners() {
        // Debounced refresh - AUMENTADO PARA 150ms
        window.addEventListener('pointsChanged', () => {
            if (this.refreshDebounceTimer) {
                clearTimeout(this.refreshDebounceTimer);
            }
            this.refreshDebounceTimer = setTimeout(() => {
                this.refreshUpgraderIfNeeded();
            }, 150); // Aumentado de 100ms para 150ms
        });
    }
    
    refreshUpgraderIfNeeded() {
        if (!this.selectedSkill || !this.selectedNode || !this.selectedRenderer) return;
        
        // Verifica se o node ainda existe no DOM
        if (!document.body.contains(this.selectedNode)) {
            this.selectedSkill = null;
            this.selectedNode = null;
            this.selectedRenderer = null;
            return;
        }
        
        const canUpgrade = this.canUpgrade(this.selectedSkill, this.selectedRenderer);
        const canDowngrade = this.selectedSkill.currentLevel > 0;
        const isMaxLevel = this.selectedSkill.currentLevel >= this.selectedSkill.maxLevel;
        
        let newState = 'locked';
        if (isMaxLevel) newState = 'max';
        else if (canUpgrade) newState = 'available';
        
        const newStateWithDowngrade = `${newState}-${canDowngrade}`;
        
        const oldUpgrader = this.selectedNode.querySelector('.skill-upgrader');
        let currentState = 'none';
        let currentHasDowngrade = false;
        
        if (oldUpgrader) {
            currentHasDowngrade = !!oldUpgrader.querySelector('.downgrade-button');
            
            if (oldUpgrader.querySelector('.upgrade-max')) currentState = 'max';
            else if (oldUpgrader.querySelector('.upgrade-button')) currentState = 'available';
            else if (oldUpgrader.querySelector('.upgrade-locked')) currentState = 'locked';
        }
        
        const currentStateWithDowngrade = `${currentState}-${currentHasDowngrade}`;
        
        // SÓ recria se o estado mudou E se passou tempo suficiente desde a última recriação
        if (currentStateWithDowngrade !== newStateWithDowngrade) {
            // Usa requestAnimationFrame para evitar thrashing do DOM
            if (this.upgraderUpdateRAF) {
                cancelAnimationFrame(this.upgraderUpdateRAF);
            }
            
            this.upgraderUpdateRAF = requestAnimationFrame(() => {
                if (oldUpgrader) oldUpgrader.remove();
                this.createUpgrader(this.selectedNode, this.selectedSkill, this.selectedRenderer);
                this.upgraderUpdateRAF = null;
            });
        }
    }
    
    updatePointsDisplay() {
        if (!this.cachedElements.pointsDisplay) {
            this.cachedElements.pointsDisplay = document.getElementById('availablePoints');
        }
        
        if (this.cachedElements.pointsDisplay) {
            this.cachedElements.pointsDisplay.textContent = this.skillPoints - this.usedPoints;
        }
    }
    
    selectSkill(skillNode, skillData, renderer) {
        this.selectedSkill = skillData;
        this.selectedNode = skillNode;
        this.selectedRenderer = renderer;
        
        skillNode.classList.add('selected');
        
        this.zoomToSkill(skillNode, skillData);
        this.createUpgrader(skillNode, skillData, renderer);
        this.createInfoInline(skillNode, skillData);
    }
    
    // Zoom OTIMIZADO - sem duplo RAF
    zoomToSkill(skillNode, skillData) {
        if (this.isTransitioning) return;
        
        const treeContent = skillNode.closest('.tree-content');
        if (!treeContent) return;
        
        this.isTransitioning = true;
        
        document.body.classList.add('skill-zoomed');
        skillNode.classList.add('zoomed');
        
        this.hideUIElements();
        this.updateTitle(skillData);
        
        // Pega posição imediatamente
        const rect = skillNode.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const skillCenterX = rect.left + rect.width / 2;
        const skillCenterY = rect.top + rect.height / 2;
        const moveX = centerX - skillCenterX;
        const moveY = centerY - skillCenterY;
        
        // Aplica transformação diretamente com RAF único
        treeContent.style.transition = 'none';
        treeContent.style.transform = 'translate(-50%, -50%)';
        
        this.addRAF(() => {
            treeContent.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Reduzido de 0.5s
            treeContent.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        });
        
        this.addCloseZoomButton();
        
        // Libera flag após animação
        this.addTimeout(() => {
            this.isTransitioning = false;
        }, 300); // Reduzido de 500ms
    }
    
    // Exit zoom OTIMIZADO
    exitZoom() {
        return new Promise((resolve) => {
            if (this.isTransitioning) {
                resolve();
                return;
            }
            
            this.isTransitioning = true;
            this.clearPending();
            
            const treeContent = document.querySelector('.tree-content');
            if (treeContent) {
                treeContent.style.transform = 'translate(-50%, -50%)';
                treeContent.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Reduzido
            }
            
            document.body.classList.remove('skill-zoomed');
            document.querySelectorAll('.skill-node.zoomed').forEach(node => {
                node.classList.remove('zoomed');
            });
            
            this.showUIElements();
            this.restoreTitle();
            
            // Remove elementos em lote
            const toRemove = document.querySelectorAll('.zoom-close-btn, .zoom-keyboard-hints');
            toRemove.forEach(el => el.remove());
            
            // Remove seleções em lote
            const selected = document.querySelectorAll('.skill-node.selected');
            selected.forEach(node => {
                node.classList.remove('selected');
                // Remove filhos de uma vez
                const children = node.querySelectorAll('.skill-info-inline, .skill-upgrader');
                children.forEach(child => child.remove());
            });
            
            this.selectedSkill = null;
            this.selectedNode = null;
            this.selectedRenderer = null;
            
            this.addTimeout(() => {
                this.isTransitioning = false;
                resolve();
            }, 300); // Reduzido de 500ms
        });
    }
    
    hideUIElements() {
        const selectors = '.nav-arrow, .navigation-dots, .scroll-hint, .keyboard-hints';
        const elements = document.querySelectorAll(selectors);
        elements.forEach(el => el.style.display = 'none');
        
        const backBtn = document.querySelector('.tree-header .back-btn');
        const langSelector = document.querySelector('.tree-header .language-selector');
        
        if (backBtn) backBtn.style.display = 'none';
        if (langSelector) langSelector.style.display = 'none';
    }
    
    showUIElements() {
        const selectors = '.nav-arrow, .navigation-dots, .scroll-hint, .keyboard-hints';
        const elements = document.querySelectorAll(selectors);
        elements.forEach(el => el.style.display = '');
        
        const backBtn = document.querySelector('.tree-header .back-btn');
        const langSelector = document.querySelector('.tree-header .language-selector');
        
        if (backBtn) backBtn.style.display = '';
        if (langSelector) langSelector.style.display = 'flex';
    }
    
    updateTitle(skillData) {
        if (!this.cachedElements.treeTitle) {
            this.cachedElements.treeTitle = document.querySelector('.tree-title');
        }
        
        if (this.cachedElements.treeTitle) {
            this.originalTitle = this.cachedElements.treeTitle.textContent;
            const skillName = t(`skill.${skillData.id}`) || skillData.name;
            this.cachedElements.treeTitle.textContent = skillName;
            this.cachedElements.treeTitle.classList.add('skill-title');
        }
    }
    
    restoreTitle() {
        if (this.cachedElements.treeTitle && this.originalTitle) {
            this.cachedElements.treeTitle.textContent = this.originalTitle;
            this.cachedElements.treeTitle.classList.remove('skill-title');
        }
    }
    
    addCloseZoomButton() {
        // Reusar se já existe
        if (this.cachedElements.closeButton) {
            document.body.appendChild(this.cachedElements.closeButton);
            this.addZoomKeyboardHints();
            return;
        }
        
        const existingBtn = document.querySelector('.zoom-close-btn');
        if (existingBtn) existingBtn.remove();
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'zoom-close-btn';
        closeBtn.innerHTML = `
            <span>✕</span>
            <span class="close-text">${t('tree.close') || 'Close'}</span>
        `;
        closeBtn.addEventListener('click', () => this.exitZoom());
        
        this.cachedElements.closeButton = closeBtn;
        document.body.appendChild(closeBtn);
        
        this.addZoomKeyboardHints();
    }
    
    addZoomKeyboardHints() {
        // Reusar se já existe
        if (this.cachedElements.keyboardHints) {
            document.body.appendChild(this.cachedElements.keyboardHints);
            return;
        }
        
        document.querySelectorAll('.zoom-keyboard-hints').forEach(hints => hints.remove());
        
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
                <span class="zoom-key">X</span>
                <span>${t('tree.removePoint') || 'Remove Point'}</span>
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
        
        this.cachedElements.keyboardHints = hints;
        document.body.appendChild(hints);
    }
    
    async toggleSkill(skillNode, skillData, renderer) {
        if (document.body.classList.contains('skill-zoomed')) {
            const isSelected = skillNode.classList.contains('selected');
            
            if (isSelected) {
                this.tryUpgrade(skillData, renderer);
            } else {
                await this.exitZoom();
                this.selectSkill(skillNode, skillData, renderer);
            }
        } else {
            this.selectSkill(skillNode, skillData, renderer);
        }
    }
    
    createUpgrader(skillNode, skillData, renderer) {
        const upgrader = document.createElement('div');
        upgrader.className = 'skill-upgrader';
        
        const canUpgrade = this.canUpgrade(skillData, renderer);
        const canDowngrade = skillData.currentLevel > 0;
        const isMaxLevel = skillData.currentLevel >= skillData.maxLevel;
        
        if (isMaxLevel) {
            upgrader.innerHTML = `<div class="upgrade-max">${t('skill.maxLevel') || 'MAX'}</div>`;
        } else if (canUpgrade) {
            upgrader.innerHTML = `
                <div class="upgrade-button" data-action="upgrade">
                    <span class="upgrade-icon">+</span>
                    <span class="upgrade-cost">1</span>
                </div>
            `;
            
            const btn = upgrader.querySelector('.upgrade-button');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.tryUpgrade(skillData, renderer);
            });
        } else {
            upgrader.innerHTML = `<div class="upgrade-locked"><span class="lock-icon">🔒</span></div>`;
        }
        
        if (canDowngrade) {
            const downgradeBtn = document.createElement('div');
            downgradeBtn.className = 'downgrade-button';
            downgradeBtn.innerHTML = `
                <span class="downgrade-icon">−</span>
                <span class="downgrade-cost">1</span>
            `;
            downgradeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.tryDowngrade(skillData, renderer);
            });
            upgrader.appendChild(downgradeBtn);
        }
        
        skillNode.appendChild(upgrader);
    }
    
    createInfoInline(skillNode, skillData) {
        const info = document.createElement('div');
        info.className = 'skill-info-inline first-render';
        
        const desc = t(`skill.${skillData.id}.desc`) || skillData.description;
        const effect = t(`skill.${skillData.id}.effect`) || skillData.effect;
        
        info.innerHTML = `
            <div class="info-desc">${desc}</div>
            <div class="info-effect">${effect}</div>
            ${this.renderRequirements(skillData)}
            ${this.renderLevelReqs(skillData)}
        `;
        
        skillNode.appendChild(info);
        
        this.addTimeout(() => {
            info.classList.remove('first-render');
        }, 300);
    }
    
    updateInfoContent(infoElement, skillData) {
        const levelReqsElement = infoElement.querySelector('.info-level-reqs');
        if (levelReqsElement) {
            const levelList = levelReqsElement.querySelector('.level-list');
            if (levelList) {
                // Atualiza apenas o conteúdo, não recria o elemento
                levelList.innerHTML = this.renderLevelBonusList(skillData);
            }
        }
    }
    
    renderLevelBonusList(skillData) {
        if (typeof skillData.levelRequirements[0] !== 'number') return '';
        
        return skillData.levelRequirements.map((levelReq, index) => {
            const isActive = index < skillData.currentLevel;
            const colorClass = isActive ? 'bonus-active' : 'bonus-inactive';
            return `<span class="${colorClass}">${levelReq}</span>`;
        }).join(' / ');
    }
    
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
    
    renderLevelReqs(skillData) {
        if (typeof skillData.levelRequirements[0] !== 'number') {
            return `<div class="info-active-skill">${t('skill.active') || 'Active Skill'}</div>`;
        }
        
        return `
            <div class="info-level-reqs">
                <span class="level-label">${t('skill.levelBonus') || 'Level Bonus'}:</span>
                <span class="level-list">${this.renderLevelBonusList(skillData)}</span>
            </div>
        `;
    }
    
    tryUpgrade(skillData, renderer) {
        // THROTTLE - bloqueia upgrades muito rápidos
        const now = Date.now();
        if (now - this.lastUpgradeTime < this.upgradeThrottle) {
            console.log('Upgrade throttled - muito rápido');
            return false;
        }
        
        if (!this.canUpgrade(skillData, renderer)) {
            const hasPoints = this.skillPoints - this.usedPoints > 0;
            const meetsRequirements = renderer.checkRequirements(skillData);
            
            if (hasPoints && !meetsRequirements) {
                this.flashMissingRequirements(skillData, renderer);
            } else {
                const node = document.querySelector(`[data-skill="${skillData.id}"]`);
                if (node) {
                    node.classList.add('shake');
                    this.addTimeout(() => node.classList.remove('shake'), 500);
                }
            }
            return false;
        }
        
        if (this.skillPoints - this.usedPoints > 0) {
            // Marca timestamp
            this.lastUpgradeTime = now;
            
            skillData.currentLevel++;
            this.usedPoints++;
            
            // Batch: adiciona à fila de atualizações
            this.pendingUpdates.add({
                type: 'upgrade',
                skillId: skillData.id,
                skillData: skillData,
                renderer: renderer
            });
            
            // Atualiza pontos imediatamente (visual importante)
            this.updatePointsDisplay();
            
            // Agenda batch update
            this.scheduleBatchUpdate();
            
            return true;
        }
        
        return false;
    }
    
    flashMissingRequirements(skillData, renderer) {
        const node = document.querySelector(`[data-skill="${skillData.id}"]`);
        if (!node) return;
        
        const infoElement = node.querySelector('.skill-info-inline');
        if (!infoElement) return;
        
        const requiresElement = infoElement.querySelector('.info-requires');
        if (!requiresElement) return;
        
        requiresElement.classList.add('flash-missing');
        this.addTimeout(() => {
            requiresElement.classList.remove('flash-missing');
        }, 1500);
        
        node.classList.add('shake');
        this.addTimeout(() => node.classList.remove('shake'), 500);
    }
    
    tryDowngrade(skillData, renderer) {
        // THROTTLE - bloqueia downgrades muito rápidos
        const now = Date.now();
        if (now - this.lastUpgradeTime < this.upgradeThrottle) {
            console.log('Downgrade throttled - muito rápido');
            return false;
        }
        
        if (skillData.currentLevel <= 0) return false;
        
        const wouldBreakDependencies = this.checkDependencies(skillData, renderer);
        if (wouldBreakDependencies) {
            const node = document.querySelector(`[data-skill="${skillData.id}"]`);
            if (node) {
                node.classList.add('shake');
                this.addTimeout(() => node.classList.remove('shake'), 500);
            }
            alert('Cannot downgrade: other skills require this level!');
            return false;
        }
        
        // Marca timestamp
        this.lastUpgradeTime = now;
        
        skillData.currentLevel--;
        this.usedPoints--;
        
        // Batch: adiciona à fila de atualizações
        this.pendingUpdates.add({
            type: 'downgrade',
            skillId: skillData.id,
            skillData: skillData,
            renderer: renderer
        });
        
        // Atualiza pontos imediatamente (visual importante)
        this.updatePointsDisplay();
        
        // Agenda batch update
        this.scheduleBatchUpdate();
        
        return true;
    }
    
    checkDependencies(skillData, renderer) {
        const tree = renderer.treeData;
        const targetLevel = skillData.currentLevel - 1;
        
        for (const skill of Object.values(tree.skills)) {
            if (skill.requires && skill.currentLevel > 0) {
                for (const req of skill.requires) {
                    const [requiredSkillId, requiredLevel] = req.split(':');
                    const reqLevel = parseInt(requiredLevel) || 1;
                    
                    if (requiredSkillId === skillData.id && reqLevel > targetLevel) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // Agenda processamento em batch das atualizações
    scheduleBatchUpdate() {
        if (this.batchUpdateRAF) return; // Já agendado
        
        this.batchUpdateRAF = requestAnimationFrame(() => {
            this.processBatchUpdates();
            this.batchUpdateRAF = null;
        });
    }
    
    // Processa todas as atualizações pendentes de uma vez
    processBatchUpdates() {
        if (this.pendingUpdates.size === 0) return;
        
        // Converte Set para Array para processar
        const updates = Array.from(this.pendingUpdates);
        this.pendingUpdates.clear();
        
        // Agrupa atualizações por skill
        const updatesBySkill = new Map();
        updates.forEach(update => {
            updatesBySkill.set(update.skillId, update);
        });
        
        // Processa cada skill uma única vez
        updatesBySkill.forEach(update => {
            const { type, skillId, skillData, renderer } = update;
            
            // Atualiza visual do renderer (já otimizado com cache e batch)
            renderer.updateSkillLevel(skillId, skillData.currentLevel);
            
            // USA CACHE do renderer se disponível
            let node = renderer.nodeCache ? renderer.nodeCache.get(skillId) : null;
            
            // Fallback para querySelector
            if (!node) {
                node = document.querySelector(`[data-skill="${skillId}"]`);
            }
            
            if (node) {
                // Atualiza conteúdo da info
                const infoElement = node.querySelector('.skill-info-inline');
                if (infoElement) {
                    this.updateInfoContent(infoElement, skillData);
                }
                
                // Animação simplificada (sem cancelar anterior - RAF já controla)
                const skillImg = node.querySelector('.skill-icon-container');
                if (skillImg) {
                    // Remove todas as classes de animação
                    skillImg.classList.remove('upgrade-flash', 'downgrade-flash');
                    
                    // Adiciona animação apropriada
                    const animClass = type === 'upgrade' ? 'upgrade-flash' : 'downgrade-flash';
                    skillImg.classList.add(animClass);
                    
                    // Remove após animação
                    this.addTimeout(() => {
                        skillImg.classList.remove(animClass);
                    }, 300);
                }
            }
        });
        
        // Dispara evento UMA VEZ após processar tudo
        window.dispatchEvent(new CustomEvent('pointsChanged'));
    }
    
    canUpgrade(skillData, renderer) {
        if (skillData.currentLevel >= skillData.maxLevel) return false;
        if (this.skillPoints - this.usedPoints <= 0) return false;
        return renderer.checkRequirements(skillData);
    }
    
    resetPoints() {
        this.usedPoints = 0;
        this.updatePointsDisplay();
        window.dispatchEvent(new CustomEvent('pointsChanged'));
    }
    
    setTotalPoints(points) {
        this.skillPoints = points;
        this.updatePointsDisplay();
    }
    
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* OTIMIZAÇÕES DE PERFORMANCE */
            .tree-content {
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
            }
            
            .skill-node.zoomed {
                z-index: 110 !important;
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform;
            }
            
            .skill-node.zoomed .skill-icon-container {
                filter: brightness(1.8) drop-shadow(0 0 40px rgba(255, 215, 0, 1)) !important;
                transform: translate(-50%, -50%) scale(1.5) !important;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                will-change: transform, filter;
            }
            
            .skill-node.zoomed .skill-glow::before {
                animation: zoomedPulse 1s ease-in-out infinite !important;
                transform: scale(2.5) !important;
            }
            
            @keyframes zoomedPulse {
                0%, 100% { opacity: 1; filter: blur(5px); }
                50% { opacity: 0.7; filter: blur(8px); }
            }
            
            .skill-zoomed .skill-node:not(.zoomed):not(.selected) {
                opacity: 0.2;
                filter: grayscale(0.8);
                transition: opacity 0.2s ease, filter 0.2s ease;
            }
            
            .skill-zoomed .constellation-lines {
                opacity: 0.2;
                transition: opacity 0.2s ease;
            }
            
            .skill-node.selected {
                z-index: 110 !important;
            }
            
            .skill-node.selected .skill-icon-container {
                filter: brightness(1.5) drop-shadow(0 0 30px rgba(255, 215, 0, 1)) !important;
                transform: translate(-50%, -50%) scale(1.3);
            }
            
            .skill-node.selected .skill-glow::before {
                animation: selectedPulse 1s ease-in-out infinite !important;
                transform: scale(2.5) !important;
            }
            
            @keyframes selectedPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            .tree-title.skill-title {
                color: #ffd700 !important;
                font-size: 1.5rem !important;
                text-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 2px 2px 0 #333 !important;
                animation: titlePulse 2s ease-in-out infinite;
                z-index: 120 !important;
                pointer-events: auto !important;
            }
            
            @keyframes titlePulse {
                0%, 100% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
            }
            
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
                transition: all 0.2s ease;
                animation: fadeIn 0.2s ease;
            }
            
            .zoom-close-btn:hover {
                border-color: #fff;
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
                transform: scale(1.05);
            }
            
            .zoom-close-btn span:first-child {
                font-size: 1rem;
            }
            
            .zoom-keyboard-hints {
                position: fixed;
                bottom: 2rem;
                left: 2rem;
                display: none;
                flex-direction: column;
                gap: 0.8rem;
                z-index: 150;
                animation: fadeInLeft 0.2s ease;
            }
            
            body.skill-zoomed .zoom-keyboard-hints {
                display: flex !important;
            }
            
            .zoom-hint {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                font-family: 'Press Start 2P', cursive;
                font-size: 0.5rem;
                color: rgba(255, 255, 255, 0.9);
            }
            
            .zoom-key {
                padding: 0.4rem 0.6rem;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid rgba(255, 255, 255, 0.3);
                color: #fff;
                font-size: 0.5rem;
                border-radius: 2px;
                text-align: center;
                white-space: nowrap;
            }
            
            @keyframes fadeInLeft {
                from { opacity: 0; transform: translateX(-20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            .skill-upgrader {
                position: absolute;
                top: -60px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 115;
                animation: fadeInUp 0.2s ease;
                display: flex;
                gap: 0.5rem;
                align-items: center;
                pointer-events: none;
            }
            
            .skill-node.zoomed .skill-upgrader {
                top: -70px;
                transform: translateX(-50%) scale(0.9);
            }
            
            .upgrade-button, .downgrade-button {
                padding: 0.3rem 0.4rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.2rem;
                transition: all 0.15s ease;
                font-family: 'Press Start 2P', cursive;
                pointer-events: auto;
                min-width: 50px;
                height: 32px;
            }
            
            .upgrade-button {
                background: rgba(0, 255, 0, 0.2);
                border: 2px solid rgba(0, 255, 0, 0.8);
            }
            
            .upgrade-button:hover {
                background: rgba(0, 255, 0, 0.4);
                border-color: #0f0;
                box-shadow: 0 0 15px rgba(0, 255, 0, 1);
                transform: scale(1.1);
            }
            
            .downgrade-button {
                background: rgba(255, 0, 0, 0.2);
                border: 2px solid rgba(255, 0, 0, 0.8);
            }
            
            .downgrade-button:hover {
                background: rgba(255, 0, 0, 0.4);
                border-color: #f00;
                box-shadow: 0 0 15px rgba(255, 0, 0, 1);
                transform: scale(1.1);
            }
            
            .upgrade-icon, .downgrade-icon {
                font-size: 0.9rem;
                font-weight: bold;
                line-height: 1;
            }
            
            .upgrade-icon { color: #0f0; }
            .downgrade-icon { color: #f00; }
            
            .upgrade-cost, .downgrade-cost {
                color: #fff;
                font-size: 0.45rem;
                line-height: 1;
            }
            
            .upgrade-locked {
                padding: 0.4rem;
                opacity: 0.5;
                pointer-events: none;
            }
            
            .lock-icon {
                font-size: 1rem;
            }
            
            .upgrade-max {
                color: #ffd700;
                font-size: 0.45rem;
                padding: 0.3rem 0.5rem;
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                font-family: 'Press Start 2P', cursive;
                white-space: nowrap;
                pointer-events: none;
            }
            
            .skill-info-inline {
                position: absolute;
                top: calc(100% + 20px);
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.98);
                border: 2px solid rgba(255, 215, 0, 0.6);
                padding: 1rem;
                min-width: 320px;
                max-width: 400px;
                z-index: 125;
                font-family: 'Press Start 2P', cursive;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 215, 0, 0.3);
                pointer-events: none;
            }
            
            .skill-info-inline.first-render {
                animation: fadeInDown 0.2s ease;
            }
            
            .skill-node.zoomed .skill-info-inline {
                top: calc(100% + 25px);
                transform: translateX(-50%) scale(1);
            }
            
            .skill-node.zoomed .skill-name {
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s ease, visibility 0.2s ease;
            }
            
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
                transition: all 0.2s ease;
            }
            
            .info-requires.flash-missing {
                animation: flashRequirements 1.5s ease;
            }
            
            @keyframes flashRequirements {
                0%, 100% {
                    color: rgba(255, 100, 100, 0.9);
                    text-shadow: none;
                }
                10%, 30%, 50%, 70%, 90% {
                    color: #ff0000;
                    text-shadow: 0 0 10px rgba(255, 0, 0, 1), 0 0 20px rgba(255, 0, 0, 0.8), 0 0 30px rgba(255, 0, 0, 0.6);
                    transform: scale(1.05);
                }
                20%, 40%, 60%, 80% {
                    color: rgba(255, 100, 100, 0.9);
                    text-shadow: none;
                    transform: scale(1);
                }
            }
            
            .info-level-reqs {
                color: rgba(255, 255, 255, 0.7);
                font-size: 0.45rem;
            }
            
            .bonus-active {
                color: #0f0;
                text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
                font-weight: bold;
                transition: color 0.2s ease, text-shadow 0.2s ease;
            }
            
            .bonus-inactive {
                color: rgba(255, 255, 255, 0.4);
                transition: color 0.2s ease;
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
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            
            @keyframes fadeInDown {
                from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            
            .skill-node.shake {
                animation: shake 0.5s ease;
            }
            
            @keyframes shake {
                0%, 100% { transform: translate(-50%, -50%) translateX(0); }
                25% { transform: translate(-50%, -50%) translateX(-5px); }
                75% { transform: translate(-50%, -50%) translateX(5px); }
            }
            
            .skill-node .skill-icon-container.upgrade-flash {
                animation: upgradeFlash 0.3s ease;
            }
            
            @keyframes upgradeFlash {
                0% { filter: brightness(1); transform: translate(-50%, -50%) scale(1); }
                50% { filter: brightness(2) drop-shadow(0 0 40px rgba(0, 255, 0, 1)); transform: translate(-50%, -50%) scale(1.3); }
                100% { filter: brightness(1); transform: translate(-50%, -50%) scale(1); }
            }
            
            .skill-node .skill-icon-container.downgrade-flash {
                animation: downgradeFlash 0.3s ease;
            }
            
            @keyframes downgradeFlash {
                0% { filter: brightness(1); transform: translate(-50%, -50%) scale(1); }
                50% { filter: brightness(0.5) drop-shadow(0 0 40px rgba(255, 0, 0, 1)); transform: translate(-50%, -50%) scale(0.8); }
                100% { filter: brightness(1); transform: translate(-50%, -50%) scale(1); }
            }
            
            body.skill-zoomed {
                overflow: hidden;
            }
            
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
                }
                
                .zoom-hint { font-size: 0.45rem; }
                .zoom-key { font-size: 0.45rem; padding: 0.3rem 0.5rem; }
                
                .upgrade-button, .downgrade-button {
                    padding: 0.3rem 0.4rem;
                    min-width: 45px;
                    height: 28px;
                }
                
                .upgrade-icon, .downgrade-icon { font-size: 0.8rem; }
                .upgrade-cost, .downgrade-cost { font-size: 0.4rem; }
            }
        `;
        document.head.appendChild(style);
    }
}

export const skillInlineSystem = new SkillInlineSystem();