// ======================
// SKILL MODAL MODULE
// ======================

import { t } from '../translations.js';

export class SkillModal {
    constructor() {
        this.modal = null;
        this.isOpen = false;
        this.currentSkill = null;
        this.init();
    }
    
    init() {
        this.createModal();
        this.setupEventListeners();
        
        // Listener para mudança de idioma
        window.addEventListener('languageChanged', () => {
            // Atualiza textos dos botões
            const upgradeBtn = this.modal.querySelector('.modal-upgrade .btn-text');
            const learnBtn = this.modal.querySelector('.modal-learn .btn-text');
            
            if (upgradeBtn) upgradeBtn.textContent = t('skill.upgrade');
            if (learnBtn) learnBtn.textContent = t('skill.learn');
            
            // Se o modal estiver aberto, re-renderiza
            if (this.isOpen && this.currentSkill) {
                this.populateModal(this.currentSkill);
            }
        });
    }
    
    // Cria a estrutura do modal
    createModal() {
        // Remove modal existente se houver
        const existing = document.getElementById('skillModal');
        if (existing) existing.remove();
        
        this.modal = document.createElement('div');
        this.modal.className = 'skill-detail-modal';
        this.modal.id = 'skillModal';
        
        this.modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">×</button>
                <div class="modal-header">
                    <img class="modal-skill-icon" src="" alt="">
                    <h3 class="modal-title"></h3>
                </div>
                <div class="modal-requirements"></div>
                <div class="modal-description"></div>
                <div class="modal-stats"></div>
                <div class="modal-levels"></div>
                <div class="modal-actions">
                    <button class="modal-btn modal-upgrade" style="display: none;">
                        <span class="btn-text">${t('skill.upgrade')}</span>
                    </button>
                    <button class="modal-btn modal-learn" style="display: none;">
                        <span class="btn-text">${t('skill.learn')}</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
    }
    
    // Configura listeners
    setupEventListeners() {
        // Fecha ao clicar no X
        this.modal.querySelector('.modal-close').addEventListener('click', () => {
            this.close();
        });
        
        // Fecha ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    // Abre o modal com dados da skill
    open(skill) {
        if (!skill) return;
        
        this.currentSkill = skill;
        this.isOpen = true;
        
        // Preenche os dados
        this.populateModal(skill);
        
        // Zoom na skill (efeito visual)
        const skillNode = document.querySelector(`[data-skill="${skill.id}"]`);
        if (skillNode) {
            skillNode.classList.add('zoomed');
        }
        
        // Mostra o modal
        this.modal.classList.add('active');
        
        // Foco no modal para acessibilidade
        this.modal.querySelector('.modal-close').focus();
    }
    
    // Preenche o modal com dados
    populateModal(skill) {
        // Ícone e título - USA TRADUÇÃO
        const icon = this.modal.querySelector('.modal-skill-icon');
        if (icon) {
            icon.src = skill.icon;
            icon.alt = skill.name;
            icon.onerror = () => {
                icon.style.display = 'none';
            };
        }
        
        // Traduz o nome da skill
        const translatedName = t(`skill.${skill.id}`) || skill.name;
        this.modal.querySelector('.modal-title').textContent = translatedName;
        
        // Requisitos - COM TRADUÇÃO
        const reqDiv = this.modal.querySelector('.modal-requirements');
        if (skill.requires && skill.requires.length > 0) {
            const requirementsList = skill.requires.map(req => {
                const [skillId, level] = req.split(':');
                const skillName = t(`skill.${skillId}`) || this.getSkillName(skillId);
                return `${skillName} Lv.${level || 1}`;
            }).join(', ');
            
            reqDiv.innerHTML = `
                <strong>${t('skill.requires')}:</strong> ${requirementsList}
            `;
            reqDiv.style.display = 'block';
        } else {
            reqDiv.style.display = 'none';
        }
        
        // Descrição - USA TRADUÇÃO
        const translatedDesc = t(`skill.${skill.id}.desc`) || skill.description;
        const translatedEffect = t(`skill.${skill.id}.effect`) || skill.effect;
        
        this.modal.querySelector('.modal-description').innerHTML = `
            <p>${translatedDesc}</p>
            <p class="skill-effect">
                <strong>${t('skill.effect')}:</strong> ${translatedEffect}
            </p>
        `;
        
        // Estatísticas detalhadas (se houver)
        const statsDiv = this.modal.querySelector('.modal-stats');
        if (skill.stats) {
            statsDiv.innerHTML = this.renderStats(skill.stats);
            statsDiv.style.display = 'block';
        } else {
            statsDiv.style.display = 'none';
        }
        
        // Níveis - COM TRADUÇÃO
        const levelsDiv = this.modal.querySelector('.modal-levels');
        if (typeof skill.levelRequirements[0] === 'number') {
            levelsDiv.innerHTML = `
                <div class="level-info">
                    <strong>${t('skill.levelReq')}:</strong> 
                    ${skill.levelRequirements.join(' / ')}
                </div>
                <div class="level-progress">
                    <strong>${t('skill.current')}:</strong> 
                    ${skill.currentLevel} / ${skill.maxLevel}
                    <div class="level-bar">
                        <div class="level-fill" style="width: ${(skill.currentLevel / skill.maxLevel) * 100}%"></div>
                    </div>
                </div>
            `;
        } else {
            levelsDiv.innerHTML = `
                <div class="skill-type-badge">
                    ${t('skill.active')}
                </div>
            `;
        }
        
        // Botões de ação
        this.updateActionButtons(skill);
    }
    
    // Atualiza botões de ação
    updateActionButtons(skill) {
        const upgradeBtn = this.modal.querySelector('.modal-upgrade');
        const learnBtn = this.modal.querySelector('.modal-learn');
        
        // Reseta botões
        upgradeBtn.style.display = 'none';
        learnBtn.style.display = 'none';
        
        if (skill.currentLevel === 0) {
            // Skill não aprendida
            if (this.checkRequirements(skill)) {
                learnBtn.style.display = 'block';
                learnBtn.onclick = () => this.learnSkill(skill);
            }
        } else if (skill.currentLevel < skill.maxLevel) {
            // Skill pode ser melhorada
            upgradeBtn.style.display = 'block';
            upgradeBtn.onclick = () => this.upgradeSkill(skill);
        }
    }
    
    // Renderiza estatísticas
    renderStats(stats) {
        return Object.entries(stats).map(([key, value]) => `
            <div class="stat-item">
                <span class="stat-name">${t(`stat.${key}`) || key}:</span>
                <span class="stat-value">+${value}</span>
            </div>
        `).join('');
    }
    
    // Fecha o modal
    close() {
        this.isOpen = false;
        this.modal.classList.remove('active');
        
        // Remove zoom de todas as skills
        document.querySelectorAll('.skill-node.zoomed').forEach(node => {
            node.classList.remove('zoomed');
        });
        
        this.currentSkill = null;
    }
    
    // Helpers
    getSkillName(skillId) {
        // Busca o nome da skill em algum lugar
        // Por enquanto, converte ID para nome
        return skillId.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
    
    checkRequirements(skill) {
        // Implementar verificação de requisitos
        return true; // Placeholder
    }
    
    learnSkill(skill) {
        console.log('Learning skill:', skill.id);
        // Implementar lógica de aprender skill
        this.close();
    }
    
    upgradeSkill(skill) {
        console.log('Upgrading skill:', skill.id);
        // Implementar lógica de upgrade
        this.close();
    }
}

// CSS adicional para o modal
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .modal-skill-icon {
        width: 50px;
        height: 50px;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
    }
    
    .skill-effect {
        color: rgba(0, 255, 255, 0.9);
        margin-top: 0.5rem;
    }
    
    .modal-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
        margin: 1rem 0;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .stat-item {
        display: flex;
        justify-content: space-between;
        font-size: 0.5rem;
        font-family: 'Press Start 2P', cursive;
    }
    
    .stat-name {
        color: rgba(255, 255, 255, 0.7);
    }
    
    .stat-value {
        color: #0f0;
        text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
    }
    
    .level-progress {
        margin-top: 0.5rem;
    }
    
    .level-bar {
        width: 100%;
        height: 20px;
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid rgba(255, 255, 255, 0.3);
        margin-top: 0.5rem;
        position: relative;
        overflow: hidden;
    }
    
    .level-fill {
        height: 100%;
        background: linear-gradient(90deg, 
            rgba(255, 215, 0, 0.8) 0%, 
            rgba(255, 100, 0, 0.8) 100%);
        transition: width 0.3s ease;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }
    
    .skill-type-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg,
            rgba(255, 100, 255, 0.2) 0%,
            rgba(255, 215, 0, 0.2) 100%);
        border: 2px solid rgba(255, 215, 0, 0.5);
        color: #ffd700;
        font-size: 0.6rem;
        font-family: 'Press Start 2P', cursive;
        text-transform: uppercase;
        text-align: center;
        animation: badgePulse 2s ease-in-out infinite;
    }
    
    @keyframes badgePulse {
        0%, 100% { 
            box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); 
        }
        50% { 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); 
        }
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 1.5rem;
    }
    
    .modal-btn {
        padding: 0.8rem 1.5rem;
        background: linear-gradient(135deg,
            rgba(0, 255, 0, 0.1) 0%,
            rgba(0, 255, 0, 0.2) 100%);
        border: 2px solid rgba(0, 255, 0, 0.3);
        color: #0f0;
        font-size: 0.6rem;
        font-family: 'Press Start 2P', cursive;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
    }
    
    .modal-btn:hover {
        background: rgba(0, 255, 0, 0.2);
        border-color: #0f0;
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.5);
        transform: scale(1.05);
    }
    
    .modal-btn:active {
        transform: scale(0.98);
    }
`;
document.head.appendChild(modalStyles);

// Exporta instância singleton
export const skillModal = new SkillModal();