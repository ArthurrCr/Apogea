// ======================
// TRANSLATION SYSTEM - ES6 MODULE
// ======================
const translations = {
    'en': {
        // Página principal
        'page.title': 'aPOGea',
        'page.description': 'Choose your class',
        'subtitle': 'Choose Your Class',
        'instructions': 'Click to select',
        'class.squire': 'Squire',
        'class.knight': 'Knight', 
        'class.mage': 'Mage',
        'class.rogue': 'Rogue',
        'error.imageNotFound': 'Image not found',
        'error.logoFallback': 'APOGEA',
        'loading': 'Loading...',
        'selected': 'Class selected',
        
        // PÁGINA DE STATS
        'stats.title': 'STATS SIMULATOR',
        'stats.back': '← BACK',
        'stats.availablePoints': 'Points',
        'stats.stat': 'Stat',
        'stats.classMultiplier': 'Class Mult',
        'stats.base': 'Base',
        'stats.points': 'Points',
        'stats.bonus': 'Bonus',
        'stats.final': 'Final',
        'stats.level': 'Level',
        'stats.traits': 'Traits',
        
        // PÁGINA DE TRAITS
        'traits.title': 'TRAITS SYSTEM',
        'traits.comingSoon': 'Coming Soon...',
        'traits.placeholder': '[TRAITS GRID]',
        'traits.back': '← BACK TO STATS',
        
        // Nomes dos traits/equipamentos
        'trait.axe': 'Axe',
        'trait.sword': 'Sword',
        'trait.staff': 'Staff',
        'trait.orb': 'Orb',
        'trait.shield': 'Shield',
        'trait.glove': 'Glove',
        'trait.bow': 'Bow',
        'trait.light_armor': 'Light Armor',
        'trait.heavy_armor': 'Heavy Armor',
        'trait.dagger': 'Dagger',
        
        // Nomes dos stats
        'stat.health': 'Health',
        'stat.mana': 'Mana',
        'stat.magic': 'Magic',
        'stat.damage': 'Damage',
        'stat.movespeed': 'Move Speed',
        'stat.ability': 'Ability',
        'stat.attackSpeed': 'Attack Speed',
        'stat.hpRegen': 'HP Regen',
        'stat.mpRegen': 'MP Regen',
        'stat.range': 'Range',
        'stat.armor': 'Armor',
        'stat.defense': 'Defense',
        'stat.capacity': 'Capacity',
        
        // PÁGINA DE TRAIT TREE
        'tree.back': '← BACK',
        'tree.scrollHint': 'DRAG OR USE ARROWS',
        'tree.navigate': 'Navigate',
        'tree.selectSkill': 'Select Skill', 
        'tree.reset': 'Reset Tree',
        'tree.close': 'Close Modal',
        'tree.confirmReset': 'Reset all skills in this tree?',
        'tree.comingSoon': 'Skill Tree - Coming Soon',

        // SISTEMA DE SKILLS
        'skill.upgrade': 'UPGRADE',
        'skill.learn': 'LEARN',
        'skill.requires': 'Requires',
        'skill.effect': 'Effect',
        'skill.levelReq': 'Level requirements',
        'skill.current': 'Current',
        'skill.active': 'Active Skill',
        'skill.passive': 'Passive Skill',
        'skill.ultimate': 'Ultimate',
        'skill.legendary': 'Legendary',
        'skill.maxLevel': 'Max Level',
        'skill.notAvailable': 'Not Available',
        'skill.locked': 'Locked',
        'skill.unlocked': 'Unlocked',
        'skill.pointsRequired': 'Points Required',
        'skill.pointsSpent': 'Points Spent',

        // SKILLS DO AXE (Inglês)
        'skill.going-big': 'Going Big',
        'skill.going-big.desc': 'Large weapons deal extra damage',
        'skill.going-big.effect': '20% extra damage at max level',
        
        'skill.steady-bloodflow': 'Steady Bloodflow',
        'skill.steady-bloodflow.desc': 'Casting spells with health regenerates mana',
        'skill.steady-bloodflow.effect': '+12 mana at max level',
        
        'skill.wrecking-it': 'Wrecking It',
        'skill.wrecking-it.desc': 'Blade/Physical spell buffs next attack\'s True Damage',
        'skill.wrecking-it.effect': '+14 damage at max level',
        
        'skill.berserker': 'Berserker',
        'skill.berserker.desc': 'Below 66% health grants extra damage',
        'skill.berserker.effect': '+13 damage at max level',
        
        'skill.overwhelming-force': 'Overwhelming Force',
        'skill.overwhelming-force.desc': 'Large weapon attacks may cast area-of-effect spell',
        'skill.overwhelming-force.effect': 'Constant effect',
        
        'skill.magic-blade': 'Magic Blade',
        'skill.magic-blade.desc': 'Removes negatives on Large weapons; gain 10% Manaleech',
        'skill.magic-blade.effect': 'Constant effect',
        
        'skill.unfathomable-rage': 'Unfathomable Rage',
        'skill.unfathomable-rage.desc': 'Converts every 2 damage taken into 1 mana; doubles cost',
        'skill.unfathomable-rage.effect': 'Constant effect',

        // MENSAGENS DO MODAL
        'modal.requirements.notMet': 'Requirements not met',
        'modal.requirements.met': 'Requirements met',
        'modal.level.current': 'Current Level',
        'modal.level.max': 'Maximum Level',
        'modal.cost': 'Cost',
        'modal.refund': 'Refund',
        'modal.confirm.learn': 'Learn this skill?',
        'modal.confirm.upgrade': 'Upgrade this skill?',
        'modal.confirm.refund': 'Refund this skill?',
        'modal.insufficient.points': 'Insufficient skill points',

        // OUTRAS TRADUÇÕES DA PÁGINA
        'page.title.traitTree': 'APOGEA - Trait Trees',
        'tree.totalPoints': 'Total Points',
        'tree.availablePoints': 'Available Points',
        'tree.resetAll': 'Reset All',
        'tree.saveTree': 'Save Tree',
        'tree.loadTree': 'Load Tree',
        'tree.exportCode': 'Export Code',
        'tree.importCode': 'Import Code'
    },

    'pt-br': {
        // Página principal
        'page.title': 'aPOGea',
        'page.description': 'Escolha sua classe e comece sua aventura épica!',
        'subtitle': 'Escolha Sua Classe',
        'instructions': 'Clique para selecionar',
        'class.squire': 'Escudeiro',
        'class.knight': 'Cavaleiro',
        'class.mage': 'Mago',
        'class.rogue': 'Ladino',
        'error.imageNotFound': 'Imagem não encontrada',
        'error.logoFallback': 'APOGEA',
        'loading': 'Carregando...',
        'selected': 'Classe selecionada',
        
        // PÁGINA DE STATS 
        'stats.title': 'SIMULADOR DE STATUS',
        'stats.back': '← VOLTAR',
        'stats.availablePoints': 'Pontos',
        'stats.stat': 'Status',
        'stats.classMultiplier': 'Mult. Classe',
        'stats.base': 'Base',
        'stats.points': 'Pontos',
        'stats.bonus': 'Bônus',
        'stats.final': 'Final',
        'stats.level': 'Nível',
        'stats.traits': 'Características',
        
        // PÁGINA DE TRAITS
        'traits.title': 'SISTEMA DE CARACTERÍSTICAS',
        'traits.comingSoon': 'Em Breve...',
        'traits.placeholder': '[GRADE DE CARACTERÍSTICAS]',
        'traits.back': '← VOLTAR PARA STATUS',
        
        // Nomes dos traits/equipamentos
        'trait.axe': 'Machado',
        'trait.sword': 'Espada',
        'trait.staff': 'Cajado',
        'trait.orb': 'Orbe',
        'trait.shield': 'Escudo',
        'trait.glove': 'Luva',
        'trait.bow': 'Arco',
        'trait.light_armor': 'Armadura Leve',
        'trait.heavy_armor': 'Armadura Pesada',
        'trait.dagger': 'Adaga',
        
        // Nomes dos stats
        'stat.health': 'Vida',
        'stat.mana': 'Mana',
        'stat.magic': 'Magia',
        'stat.damage': 'Dano',
        'stat.movespeed': 'Vel. Movimento',
        'stat.ability': 'Habilidade',
        'stat.attackSpeed': 'Vel. Ataque',
        'stat.hpRegen': 'Regen. Vida',
        'stat.mpRegen': 'Regen. Mana',
        'stat.range': 'Alcance',
        'stat.armor': 'Armadura',
        'stat.defense': 'Defesa',
        'stat.capacity': 'Capacidade',

         // PÁGINA DE TRAIT TREE
        'tree.back': '← VOLTAR',
        'tree.scrollHint': 'ARRASTE OU USE AS SETAS',
        'tree.navigate': 'Navegar',
        'tree.selectSkill': 'Selecionar Habilidade',
        'tree.reset': 'Resetar Árvore',
        'tree.close': 'Fechar',
        'tree.confirmReset': 'Resetar todas as habilidades desta árvore?',
        'tree.comingSoon': 'Árvore de Habilidades - Em Breve',

        // SISTEMA DE SKILLS
        'skill.upgrade': 'MELHORAR',
        'skill.learn': 'APRENDER',
        'skill.requires': 'Requer',
        'skill.effect': 'Efeito',
        'skill.levelReq': 'Requisitos de nível',
        'skill.current': 'Atual',
        'skill.active': 'Habilidade Ativa',
        'skill.passive': 'Habilidade Passiva',
        'skill.ultimate': 'Ultimate',
        'skill.legendary': 'Lendária',
        'skill.maxLevel': 'Nível Máximo',
        'skill.notAvailable': 'Não Disponível',
        'skill.locked': 'Bloqueada',
        'skill.unlocked': 'Desbloqueada',
        'skill.pointsRequired': 'Pontos Necessários',
        'skill.pointsSpent': 'Pontos Gastos',

        // SKILLS DO AXE (Português)
        'skill.going-big': 'Ficando Grande',
        'skill.going-big.desc': 'Armas grandes causam dano extra',
        'skill.going-big.effect': '20% de dano extra no nível máximo',
        
        'skill.steady-bloodflow': 'Fluxo Sanguíneo Estável',
        'skill.steady-bloodflow.desc': 'Lançar magias com vida regenera mana',
        'skill.steady-bloodflow.effect': '+12 de mana no nível máximo',
        
        'skill.wrecking-it': 'Destruindo Tudo',
        'skill.wrecking-it.desc': 'Magia de Lâmina/Física melhora o Dano Verdadeiro do próximo ataque',
        'skill.wrecking-it.effect': '+14 de dano no nível máximo',
        
        'skill.berserker': 'Berserker',
        'skill.berserker.desc': 'Abaixo de 66% de vida concede dano extra',
        'skill.berserker.effect': '+13 de dano no nível máximo',
        
        'skill.overwhelming-force': 'Força Avassaladora',
        'skill.overwhelming-force.desc': 'Ataques com armas grandes podem lançar magia em área',
        'skill.overwhelming-force.effect': 'Efeito constante',
        
        'skill.magic-blade': 'Lâmina Mágica',
        'skill.magic-blade.desc': 'Remove negativos em armas grandes; ganha 10% de Roubo de Mana',
        'skill.magic-blade.effect': 'Efeito constante',
        
        'skill.unfathomable-rage': 'Fúria Insondável',
        'skill.unfathomable-rage.desc': 'Converte cada 2 de dano recebido em 1 de mana; dobra o custo',
        'skill.unfathomable-rage.effect': 'Efeito constante',

        // MENSAGENS DO MODAL
        'modal.requirements.notMet': 'Requisitos não atendidos',
        'modal.requirements.met': 'Requisitos atendidos',
        'modal.level.current': 'Nível Atual',
        'modal.level.max': 'Nível Máximo',
        'modal.cost': 'Custo',
        'modal.refund': 'Reembolsar',
        'modal.confirm.learn': 'Aprender esta habilidade?',
        'modal.confirm.upgrade': 'Melhorar esta habilidade?',
        'modal.confirm.refund': 'Reembolsar esta habilidade?',
        'modal.insufficient.points': 'Pontos de habilidade insuficientes',

        // OUTRAS TRADUÇÕES DA PÁGINA
        'page.title.traitTree': 'APOGEA - Árvores de Traits',
        'tree.totalPoints': 'Pontos Totais',
        'tree.availablePoints': 'Pontos Disponíveis',
        'tree.resetAll': 'Resetar Tudo',
        'tree.saveTree': 'Salvar Árvore',
        'tree.loadTree': 'Carregar Árvore',
        'tree.exportCode': 'Exportar Código',
        'tree.importCode': 'Importar Código'

    }
};

// Idioma atual
let currentLanguage = localStorage.getItem('gameLanguage') || 'en';

// Função de tradução
export function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Aplica traduções na página
export function applyTranslations() {
    document.documentElement.lang = currentLanguage === 'pt-br' ? 'pt-BR' : 'en';
    
    document.title = t('page.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = t('page.description');
    }
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

// Define o idioma
export function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('gameLanguage', lang);
    applyTranslations();
    
    // Dispara evento customizado
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

// Obtém idioma atual
export function getCurrentLanguage() {
    return currentLanguage;
}

// Inicializa o sistema de tradução
export function initTranslations() {
    // Aplica traduções iniciais
    applyTranslations();
    
    // Configura listeners dos botões de idioma
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
}

// Auto-inicialização quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTranslations);
} else {
    initTranslations();
}

// Exporta também para uso global (compatibilidade)
window.t = t;
window.setLanguage = setLanguage;