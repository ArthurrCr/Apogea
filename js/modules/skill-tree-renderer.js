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
    }
    
    // Cria SVG com as linhas de conexão
    createConnectionsSVG() {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('constellation-lines');
        svg.setAttribute('viewBox', '0 0 800 600');
        
        this.treeData.connections.forEach(connection => {
            const line = this.createConnectionLine(connection);
            svg.appendChild(line);
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
        
        // Converte posições percentuais para coordenadas SVG
        line.setAttribute('x1', fromSkill.position.x * 8);
        line.setAttribute('y1', fromSkill.position.y * 6);
        line.setAttribute('x2', toSkill.position.x * 8);
        line.setAttribute('y2', toSkill.position.y * 6);
        
        return line;
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
        
        // Adiciona imagem
        const img = document.createElement('img');
        img.src = skill.icon;
        img.alt = skill.name;
        img.onerror = () => this.handleImageError(img, skill.name);
        node.appendChild(img);
        
        // Adiciona nome - TRADUZIDO
        const nameElement = document.createElement('span');
        nameElement.className = 'skill-name';
        const translatedName = t(`skill.${skill.id}`) || skill.name;
        nameElement.textContent = translatedName;
        node.appendChild(nameElement);
        
        // Adiciona indicadores de nível
        if (skill.maxLevel > 1) {
            const levels = this.createLevelIndicators(skill);
            node.appendChild(levels);
        }
        
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
    handleImageError(img, skillName) {
        img.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.className = 'skill-placeholder';
        placeholder.textContent = skillName.charAt(0);
        img.parentElement.appendChild(placeholder);
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
    }
}

// CSS adicional para o placeholder
const style = document.createElement('style');
style.textContent = `
    .skill-placeholder {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: rgba(255, 255, 255, 0.3);
        background: radial-gradient(circle, 
            rgba(255, 255, 255, 0.1) 0%, 
            transparent 70%);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Press Start 2P', cursive;
        text-transform: uppercase;
    }
`;
document.head.appendChild(style);