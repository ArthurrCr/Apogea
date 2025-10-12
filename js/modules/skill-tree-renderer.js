// ======================
// SKILL TREE RENDERER MODULE - OTIMIZADO
// ======================

import { t } from '../translations.js';

export class SkillTreeRenderer {
    constructor(container, treeData) {
        this.container = container;
        this.treeData = treeData;
        this.selectedSkills = new Set();
        this.skillPoints = 0;
        
        // CACHE para otimização
        this.connectionLinesCache = new Map(); // Cacheia linhas SVG
        this.nodeCache = new Map(); // Cacheia nodes DOM
        
        // Batch updates para conexões
        this.pendingConnectionUpdates = new Set();
        this.connectionUpdateRAF = null;
    }
    
    // Renderiza a árvore completa
    render() {
        this.container.innerHTML = '';
        
        // Limpa caches
        this.connectionLinesCache.clear();
        this.nodeCache.clear();
        
        // Cria o SVG para as conexões
        const svg = this.createConnectionsSVG();
        this.container.appendChild(svg);
        
        // Cria o container das skills
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'skill-constellation';
        
        // Renderiza cada skill
        Object.values(this.treeData.skills).forEach(skill => {
            const skillNode = this.createSkillNode(skill);
            skillsContainer.appendChild(skillNode);
            
            // Cacheia node
            this.nodeCache.set(skill.id, skillNode);
        });
        
        this.container.appendChild(skillsContainer);
        
        // Atualiza estado inicial das linhas
        this.updateAllConnections();
    }
    
    // Cria SVG com as linhas de conexão - OTIMIZADO COM CACHE
    createConnectionsSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('constellation-lines');
        
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');
        
        this.treeData.connections.forEach(connection => {
            const line = this.createConnectionLine(connection);
            if (line) {
                svg.appendChild(line);
                
                // CACHEIA a linha para acesso rápido
                const cacheKey = `${connection.from}-${connection.to}`;
                this.connectionLinesCache.set(cacheKey, line);
            }
        });
        
        return svg;
    }
    
    // Cria uma linha de conexão
    createConnectionLine(connection) {
        const fromSkill = this.treeData.skills[connection.from];
        const toSkill = this.treeData.skills[connection.to];
        
        if (!fromSkill || !toSkill) return null;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('skill-line', connection.type);
        
        line.setAttribute('data-connection', `${connection.from}-${connection.to}`);
        
        line.setAttribute('x1', fromSkill.position.x);
        line.setAttribute('y1', fromSkill.position.y);
        line.setAttribute('x2', toSkill.position.x);
        line.setAttribute('y2', toSkill.position.y);
        
        return line;
    }
    
    // Atualiza estado de uma conexão específica - OTIMIZADO COM CACHE
    updateConnection(fromSkillId, toSkillId) {
        const fromSkill = this.treeData.skills[fromSkillId];
        const toSkill = this.treeData.skills[toSkillId];
        
        if (!fromSkill || !toSkill) return;
        
        // USA CACHE em vez de querySelector (muito mais rápido!)
        const cacheKey = `${fromSkillId}-${toSkillId}`;
        const line = this.connectionLinesCache.get(cacheKey);
        
        if (!line) return;
        
        // Ativa linha se AMBAS as skills têm nível > 0
        const shouldBeActive = fromSkill.currentLevel > 0 && toSkill.currentLevel > 0;
        const isActive = line.classList.contains('active');
        
        // Só atualiza se mudou (evita reflow desnecessário)
        if (shouldBeActive !== isActive) {
            if (shouldBeActive) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        }
    }
    
    // Atualiza TODAS as conexões de uma skill específica - OTIMIZADO COM BATCH
    updateSkillConnections(skillId) {
        // Adiciona à fila de updates em vez de atualizar imediatamente
        this.pendingConnectionUpdates.add(skillId);
        
        // Agenda batch update
        this.scheduleConnectionUpdate();
    }
    
    // Agenda processamento em batch das conexões
    scheduleConnectionUpdate() {
        if (this.connectionUpdateRAF) return; // Já agendado
        
        this.connectionUpdateRAF = requestAnimationFrame(() => {
            this.processPendingConnectionUpdates();
            this.connectionUpdateRAF = null;
        });
    }
    
    // Processa todas as atualizações de conexões pendentes
    processPendingConnectionUpdates() {
        if (this.pendingConnectionUpdates.size === 0) return;
        
        // Para cada skill com updates pendentes
        this.pendingConnectionUpdates.forEach(skillId => {
            // Encontra todas as conexões relacionadas a esta skill
            this.treeData.connections.forEach(connection => {
                if (connection.from === skillId || connection.to === skillId) {
                    this.updateConnection(connection.from, connection.to);
                }
            });
        });
        
        // Limpa fila
        this.pendingConnectionUpdates.clear();
    }
    
    // Atualiza TODAS as conexões da árvore
    updateAllConnections() {
        this.treeData.connections.forEach(connection => {
            this.updateConnection(connection.from, connection.to);
        });
    }
    
    // Cria um nó de skill
    createSkillNode(skill) {
        const node = document.createElement('div');
        node.className = `skill-node ${skill.type}`;
        node.dataset.skill = skill.id;
        
        node.style.left = `${skill.position.x}%`;
        node.style.top = `${skill.position.y}%`;
        
        if (skill.currentLevel > 0) {
            node.classList.add('active');
        }
        
        if (skill.requires.length > 0) {
            node.dataset.requires = skill.requires.join(',');
        }
        
        // Cria o glow
        const glow = document.createElement('div');
        glow.className = 'skill-glow';
        node.appendChild(glow);
        
        // Cria container da imagem com fundo
        const imgContainer = document.createElement('div');
        imgContainer.className = 'skill-icon-container';
        
        // Adiciona imagem
        const img = document.createElement('img');
        img.src = skill.icon;
        img.alt = skill.name;
        img.onerror = () => this.handleImageError(img, skill.name, imgContainer);
        imgContainer.appendChild(img);
        node.appendChild(imgContainer);
        
        // Adiciona nome - TRADUZIDO
        const nameElement = document.createElement('span');
        nameElement.className = 'skill-name';
        const translatedName = t(`skill.${skill.id}`) || skill.name;
        nameElement.textContent = translatedName;
        node.appendChild(nameElement);
        
        // Adiciona indicadores de nível
        const levels = this.createLevelIndicators(skill);
        node.appendChild(levels);
        
        // Adiciona evento de clique
        node.addEventListener('click', () => this.onSkillClick(skill));
        
        return node;
    }
    
    // Cria indicadores de nível
    createLevelIndicators(skill) {
        const container = document.createElement('div');
        container.className = 'skill-levels';
        
        for (let i = 0; i < skill.maxLevel; i++) {
            const pip = document.createElement('span');
            pip.className = 'level-pip';
            if (i < skill.currentLevel) {
                pip.classList.add('active');
            }
            container.appendChild(pip);
        }
        
        return container;
    }
    
    // Trata erro de imagem
    handleImageError(img, skillName, imgContainer) {
        img.onerror = null;
        img.src = '../assets/images/skills/default.png';
        
        img.onerror = () => {
            img.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'skill-placeholder';
            
            placeholder.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            `;
            
            imgContainer.appendChild(placeholder);
        };
    }
    
    // Callback de clique na skill
    onSkillClick(skill) {
        if (window.skillInlineSystem) {
            // USA CACHE em vez de querySelector
            let node = this.nodeCache.get(skill.id);
            
            // Fallback se cache falhou
            if (!node) {
                node = document.querySelector(`[data-skill="${skill.id}"]`);
                if (node) {
                    this.nodeCache.set(skill.id, node);
                }
            }
            
            if (node) {
                window.skillInlineSystem.toggleSkill(node, skill, this);
            }
        }
    }
    
    // Define callback para clique
    setSkillClickCallback(callback) {
        this.skillClickCallback = callback;
    }
    
    // Atualiza o nível de uma skill - OTIMIZADO COM CACHE
    updateSkillLevel(skillId, newLevel) {
        const skill = this.treeData.skills[skillId];
        if (!skill) return;
        
        skill.currentLevel = Math.min(newLevel, skill.maxLevel);
        
        // USA CACHE em vez de querySelector
        let node = this.nodeCache.get(skillId);
        
        // Fallback se cache falhou
        if (!node) {
            node = this.container.querySelector(`[data-skill="${skillId}"]`);
            if (node) {
                this.nodeCache.set(skillId, node);
            }
        }
        
        if (node) {
            // Atualiza classe ativa (só se mudou)
            const shouldBeActive = skill.currentLevel > 0;
            const isActive = node.classList.contains('active');
            
            if (shouldBeActive !== isActive) {
                if (shouldBeActive) {
                    node.classList.add('active');
                } else {
                    node.classList.remove('active');
                }
            }
            
            // Atualiza pips (só os que mudaram)
            const pips = node.querySelectorAll('.level-pip');
            pips.forEach((pip, index) => {
                const shouldBeActive = index < skill.currentLevel;
                const isActive = pip.classList.contains('active');
                
                if (shouldBeActive !== isActive) {
                    if (shouldBeActive) {
                        pip.classList.add('active');
                    } else {
                        pip.classList.remove('active');
                    }
                }
            });
        }
        
        // BATCH UPDATE das conexões (em vez de imediato)
        this.updateSkillConnections(skillId);
    }
    
    // Verifica se os requisitos foram atendidos
    checkRequirements(skill) {
        if (skill.requires.length === 0) return true;
        
        return skill.requires.every(req => {
            const [skillId, level] = req.split(':');
            const requiredSkill = this.treeData.skills[skillId];
            const requiredLevel = parseInt(level) || 1;
            
            return requiredSkill && requiredSkill.currentLevel >= requiredLevel;
        });
    }
    
    // Reseta todas as skills
    reset() {
        Object.values(this.treeData.skills).forEach(skill => {
            this.updateSkillLevel(skill.id, 0);
        });
        
        // Atualiza todas as conexões após reset
        this.updateAllConnections();
    }
    
    // Limpa recursos (útil para destroy)
    dispose() {
        // Cancela RAF pendente
        if (this.connectionUpdateRAF) {
            cancelAnimationFrame(this.connectionUpdateRAF);
            this.connectionUpdateRAF = null;
        }
        
        // Limpa caches
        this.connectionLinesCache.clear();
        this.nodeCache.clear();
        this.pendingConnectionUpdates.clear();
    }
}

// CSS adicional para o placeholder
const style = document.createElement('style');
style.textContent = `
    /* Container da imagem com fundo estilo key-badge */
    .skill-icon-container {
        width: 60px;
        height: 60px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(100, 100, 100, 0.4);
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        z-index: 2;
        transition: all 0.3s ease;
        will-change: transform, filter;
    }
    
    .skill-icon-container img {
        width: 48px;
        height: 48px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: brightness(0.3) grayscale(1);
        transition: filter 0.3s ease;
        position: relative;
        transform: none;
    }
    
    .skill-node.active .skill-icon-container {
        background: rgba(120, 120, 120, 0.5);
        border-color: rgba(255, 255, 255, 0.6);
    }
    
    .skill-node.active .skill-icon-container img {
        filter: brightness(1) grayscale(0);
    }
    
    .skill-node:hover .skill-icon-container {
        background: rgba(140, 140, 140, 0.6);
        border-color: rgba(255, 255, 255, 0.6);
        transform: translate(-50%, -50%) scale(1.05);
    }
    
    .skill-node:hover .skill-icon-container img {
        filter: brightness(1.2);
    }
    
    .skill-node.zoomed .skill-icon-container {
        transform: translate(-50%, -50%) scale(1.5);
    }
    
    .skill-node.zoomed .skill-icon-container img {
        filter: brightness(1.8) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8));
    }
    
    .skill-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.3);
        position: relative;
    }
    
    .skill-placeholder svg {
        width: 32px;
        height: 32px;
        opacity: 0.5;
        stroke: rgba(255, 255, 255, 0.6);
    }
`;
document.head.appendChild(style);