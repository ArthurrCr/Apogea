// ======================
// TRANSLATION SYSTEM
// ======================
const translations = {
    'en': {
        'page.title': 'aPOGea',
        'page.description': 'Choose your class and start your epic adventure!',
        'subtitle': 'Choose Your Class',
        'instructions': 'Click to select',
        'class.squire': 'Squire',
        'class.knight': 'Knight', 
        'class.mage': 'Mage',
        'class.rogue': 'Rogue',
        'error.imageNotFound': 'Image not found',
        'error.logoFallback': 'RPG PIXEL',
        'loading': 'Loading...',
        'selected': 'Class selected'
    },
    'pt-br': {
        'page.title': 'aPOGea',
        'page.description': 'Escolha sua classe e comece sua aventura épica!',
        'subtitle': 'Escolha Sua Classe',
        'instructions': 'Clique para selecionar',
        'class.squire': 'Escudeiro',
        'class.knight': 'Cavaleiro',
        'class.mage': 'Mago',
        'class.rogue': 'Ladino',
        'error.imageNotFound': 'Imagem não encontrada',
        'error.logoFallback': 'RPG PIXEL',
        'loading': 'Carregando...',
        'selected': 'Classe selecionada'
    }
};

// Current language (default: English)
let currentLanguage = localStorage.getItem('gameLanguage') || 'en';

// Translation function
function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Apply translations to DOM
function applyTranslations() {
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage === 'pt-br' ? 'pt-BR' : 'en';
    
    // Update page title and meta
    document.title = t('page.title');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = t('page.description');
    }
    
    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

// Change language
function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('gameLanguage', lang);
    applyTranslations();
    
    // Re-apply error handlers with new language
    if (typeof handleImageErrors === 'function') {
        handleImageErrors();
    }
}

// Initialize translations when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    
    // Setup language selector buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.dataset.lang);
        });
    });
});