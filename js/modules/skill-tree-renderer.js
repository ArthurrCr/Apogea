// ======================
// SKILL TREE RENDERER MODULE
// ======================

import { t } from '../translations.js';

export class SkillTreeRenderer {
    constructor(container, treeData) {
        this.container = container;
        this.treeData = treeData;
        this.selectedSkills = new Set();
        this.skillPoints = 0;
    }
    
    // Renderiza a árvore completa
    render() {
        this.container.innerHTML = '';
        
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
        });
        
        this.container.appendChild(skillsContainer);
        
        // Atualiza estado inicial das linhas
        this.updateAllConnections();
    }
    
    // Cria SVG com as linhas de conexão - CORRIGIDO
    createConnectionsSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('constellation-lines');
        
        // ViewBox em porcentagem (0 0 100 100) para trabalhar diretamente com as posições
        svg.setAttribute('viewBox', '0 0 100 100');
        
        // Preserva aspect ratio para que as linhas escalem corretamente
        svg.setAttribute('preserveAspectRatio', 'none');
        
        this.treeData.connections.forEach(connection => {
            const line = this.createConnectionLine(connection);
            if (line) {
                svg.appendChild(line);
            }
        });
        
        return svg;
    }
    
    // Cria uma linha de conexão - CORRIGIDO
    createConnectionLine(connection) {
        const fromSkill = this.treeData.skills[connection.from];
        const toSkill = this.treeData.skills[connection.to];
        
        if (!fromSkill || !toSkill) return null;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.classList.add('skill-line', connection.type);
        
        // Adiciona atributo data para identificar a conexão
        line.setAttribute('data-connection', `${connection.from}-${connection.to}`);
        
        // Usa as posições diretamente como porcentagem (viewBox é 0 0 100 100)
        line.setAttribute('x1', fromSkill.position.x);
        line.setAttribute('y1', fromSkill.position.y);
        line.setAttribute('x2', toSkill.position.x);
        line.setAttribute('y2', toSkill.position.y);
        
        return line;
    }
    
    // Atualiza estado de uma conexão específica
    updateConnection(fromSkillId, toSkillId) {
        const fromSkill = this.treeData.skills[fromSkillId];
        const toSkill = this.treeData.skills[toSkillId];
        
        if (!fromSkill || !toSkill) return;
        
        // Encontra a linha no SVG
        const line = this.container.querySelector(
            `line[data-connection="${fromSkillId}-${toSkillId}"]`
        );
        
        if (!line) return;
        
        // Ativa linha se AMBAS as skills têm nível > 0
        if (fromSkill.currentLevel > 0 && toSkill.currentLevel > 0) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    }
    
    // Atualiza TODAS as conexões de uma skill específica
    updateSkillConnections(skillId) {
        // Verifica todas as conexões da árvore
        this.treeData.connections.forEach(connection => {
            // Se a skill é origem ou destino desta conexão, atualiza
            if (connection.from === skillId || connection.to === skillId) {
                this.updateConnection(connection.from, connection.to);
            }
        });
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
        
        // Define a posição
        node.style.left = `${skill.position.x}%`;
        node.style.top = `${skill.position.y}%`;
        
        // Adiciona classes baseadas no estado
        if (skill.currentLevel > 0) {
            node.classList.add('active');
        }
        
        // Verifica requisitos
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
        
        // Adiciona indicadores de nível (TODAS as skills, incluindo maxLevel 1)
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
        // Tenta carregar imagem padrão
        img.onerror = null; // Remove handler para evitar loop
        img.src = '../assets/images/skills/default.png';
        
        // Se a imagem padrão também falhar, cria placeholder visual
        img.onerror = () => {
            img.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'skill-placeholder';
            
            // Adiciona ícone SVG genérico em vez de letra
            placeholder.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
            `;
            
            imgContainer.appendChild(placeholder);
        };
    }
    
    // Callback de clique na skill - SISTEMA INLINE
    onSkillClick(skill) {
        // Usa o sistema inline em vez de callback
        if (window.skillInlineSystem) {
            const node = document.querySelector(`[data-skill="${skill.id}"]`);
            if (node) {
                window.skillInlineSystem.toggleSkill(node, skill, this);
            }
        }
    }
    
    // Define callback para clique
    setSkillClickCallback(callback) {
        this.skillClickCallback = callback;
    }
    
    // Atualiza o nível de uma skill
    updateSkillLevel(skillId, newLevel) {
        const skill = this.treeData.skills[skillId];
        if (!skill) return;
        
        skill.currentLevel = Math.min(newLevel, skill.maxLevel);
        const node = this.container.querySelector(`[data-skill="${skillId}"]`);
        
        if (node) {
            // Atualiza classe ativa
            if (skill.currentLevel > 0) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
            
            // Atualiza pips
            const pips = node.querySelectorAll('.level-pip');
            pips.forEach((pip, index) => {
                if (index < skill.currentLevel) {
                    pip.classList.add('active');
                } else {
                    pip.classList.remove('active');
                }
            });
        }
        
        // ATUALIZA AS LINHAS conectadas a esta skill
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
        border-color: rgba(255, 215, 0, 0.5);
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