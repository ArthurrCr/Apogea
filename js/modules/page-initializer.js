// ======================
// PAGE INITIALIZER - Centraliza inicialização comum
// ======================

import { createStars } from './stars.js';
import { initTranslations } from '../translations.js';

/**
 * Inicializa componentes comuns em todas as páginas
 * @param {Object} options - Opções de configuração
 * @param {boolean} options.stars - Criar estrelas (default: true)
 * @param {boolean} options.translations - Inicializar traduções (default: true)
 * @param {boolean} options.languageSelector - Injetar seletor de idioma (default: true)
 * @param {boolean} options.starsContainer - Injetar container de estrelas (default: true)
 */
export function initPage(options = {}) {
    const config = {
        stars: true,
        translations: true,
        languageSelector: true,
        starsContainer: true,
        ...options
    };
    
    // Injeta HTML comum
    if (config.starsContainer) {
        injectStarsContainer();
    }
    
    if (config.languageSelector) {
        injectLanguageSelector();
    }
    
    // Inicializa componentes
    if (config.stars) {
        createStars();
    }
    
    if (config.translations) {
        initTranslations();
    }
}

/**
 * Injeta container de estrelas se não existir
 */
function injectStarsContainer() {
    if (!document.getElementById('stars')) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        starsContainer.id = 'stars';
        document.body.insertBefore(starsContainer, document.body.firstChild);
    }
}

/**
 * Injeta seletor de idioma se não existir
 */
function injectLanguageSelector() {
    if (!document.querySelector('.language-selector')) {
        const selector = document.createElement('div');
        selector.className = 'language-selector';
        selector.innerHTML = `
            <button class="lang-btn" data-lang="en">EN</button>
            <button class="lang-btn" data-lang="pt-br">PT</button>
        `;
        document.body.insertBefore(selector, document.body.firstChild);
    }
}

/**
 * Auto-inicialização quando DOM carregar
 * Detecta tipo de página e inicializa automaticamente
 */
export function autoInit() {
    document.addEventListener('DOMContentLoaded', () => {
        // Detecta se é página com necessidades especiais
        const isMinimal = document.body.classList.contains('minimal-page');
        
        if (!isMinimal) {
            initPage();
        }
    });
}

// Exporta também função para uso direto
export default initPage;