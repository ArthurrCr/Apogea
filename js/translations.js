// ======================
// TRANSLATION SYSTEM
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
        
        // PÁGINA DE STATS - NOVO
        'stats.title': 'STATS SIMULATOR',
        'stats.back': '← BACK',
        'stats.availablePoints': 'Available Points',
        'stats.stat': 'Stat',
        'stats.classMultiplier': 'Class Mult',
        'stats.base': 'Base',
        'stats.points': 'Points',
        'stats.bonus': 'Bonus',
        'stats.final': 'Final',
        'stats.level': 'Level',
        
        // Nomes dos stats
        'stat.health': 'Health',
        'stat.mana': 'Mana',
        'stat.magic': 'Magic',
        'stat.damage': 'Damage',
        'stat.movespeed': 'Move Speed',
        'stat.ability': 'Ability',
        'stat.skill': 'Skill',
        'stat.attackSpeed': 'Attack Speed',
        'stat.hpRegen': 'HP Regen',
        'stat.mpRegen': 'MP Regen',
        'stat.range': 'Range',
        'stat.armor': 'Armor',
        'stat.defense': 'Defense',
        'stat.capacity': 'Capacity'
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
        'stats.availablePoints': 'Pontos Disponíveis',
        'stats.stat': 'Status',
        'stats.classMultiplier': 'Mult. Classe',
        'stats.base': 'Base',
        'stats.points': 'Pontos',
        'stats.bonus': 'Bônus',
        'stats.final': 'Final',
        'stats.level': 'Nível',
        
        // Nomes dos stats
        'stat.health': 'Vida',
        'stat.mana': 'Mana',
        'stat.magic': 'Magia',
        'stat.damage': 'Dano',
        'stat.movespeed': 'Vel. Movimento',
        'stat.ability': 'Habilidade',
        'stat.skill': 'Perícia',
        'stat.attackSpeed': 'Vel. Ataque',
        'stat.hpRegen': 'Regen. Vida',
        'stat.mpRegen': 'Regen. Mana',
        'stat.range': 'Alcance',
        'stat.armor': 'Armadura',
        'stat.defense': 'Defesa',
        'stat.capacity': 'Capacidade'
    }
};

// Resto do código continua igual...
let currentLanguage = localStorage.getItem('gameLanguage') || 'en';

function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

function applyTranslations() {
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

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('gameLanguage', lang);
    applyTranslations();
    
    // Se estiver na página de stats, re-renderiza
    if (typeof renderStats === 'function') {
        renderStats();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
});

// Re-renderiza stats quando mudar idioma (se estiver na página de stats)
window.addEventListener('languageChanged', () => {
    if (typeof renderStats === 'function') {
        renderStats();
    }
});

// Dispara evento customizado quando mudar idioma
const originalSetLanguage = setLanguage;
window.setLanguage = function(lang) {
    originalSetLanguage(lang);
    window.dispatchEvent(new Event('languageChanged'));
};