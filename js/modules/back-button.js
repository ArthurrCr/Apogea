// ======================
// BACK BUTTON COMPONENT - Botão reutilizável
// ======================

import { blackholeTransition } from './blackhole-transition.js';
import { t } from '../translations.js';

/**
 * Cria e configura um botão de voltar
 * @param {Object} options - Configurações do botão
 * @param {string} options.href - URL de destino
 * @param {string} options.text - Texto do botão (i18n key)
 * @param {boolean} options.useTransition - Usar transição blackhole (default: true)
 * @param {boolean} options.preserveParams - Preservar parâmetros de URL (default: false)
 * @param {string} options.position - Posição: 'top-left' | 'top-right' (default: 'top-left')
 * @param {Function} options.onClick - Callback adicional
 * @returns {HTMLElement} Elemento do botão
 */
export function createBackButton(options = {}) {
    const config = {
        href: '../index.html',
        text: 'stats.back',
        useTransition: true,
        preserveParams: false,
        position: 'top-left',
        ...options
    };
    
    // Remove botão existente se houver
    const existing = document.querySelector('.back-btn');
    if (existing) existing.remove();
    
    // Cria elemento
    const button = document.createElement('a');
    button.className = 'back-btn';
    button.href = config.href;
    
    // Define posição
    if (config.position === 'top-right') {
        button.classList.add('back-btn-right');
    }
    
    // Define texto
    const span = document.createElement('span');
    span.setAttribute('data-i18n', config.text);
    span.textContent = t(config.text);
    button.appendChild(span);
    
    // Configura evento
    button.addEventListener('click', (e) => {
        e.preventDefault();
        
        let targetUrl = config.href;
        
        // Preserva parâmetros se solicitado
        if (config.preserveParams) {
            const currentParams = new URLSearchParams(window.location.search);
            const classParam = currentParams.get('class');
            
            if (classParam) {
                const separator = targetUrl.includes('?') ? '&' : '?';
                targetUrl += `${separator}class=${classParam}`;
            }
        }
        
        // Callback customizado
        if (config.onClick) {
            config.onClick(targetUrl);
        }
        
        // Navega
        if (config.useTransition) {
            blackholeTransition.execute(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
    });
    
    // Adiciona ao DOM
    document.body.appendChild(button);
    
    return button;
}

/**
 * Inicializa botão a partir de elemento existente
 * @param {string} selector - Seletor do botão existente
 * @param {Object} options - Opções de configuração
 */
export function initBackButton(selector = '.back-btn, #backButton', options = {}) {
    const button = document.querySelector(selector);
    
    if (!button) return null;
    
    const config = {
        useTransition: true,
        preserveParams: false,
        ...options
    };
    
    button.addEventListener('click', (e) => {
        e.preventDefault();
        
        let targetUrl = button.href;
        
        if (config.preserveParams) {
            const currentParams = new URLSearchParams(window.location.search);
            const classParam = currentParams.get('class');
            
            if (classParam) {
                const separator = targetUrl.includes('?') ? '&' : '?';
                targetUrl += `${separator}class=${classParam}`;
            }
        }
        
        if (config.onClick) {
            config.onClick(targetUrl);
        }
        
        if (config.useTransition) {
            blackholeTransition.execute(targetUrl);
        } else {
            window.location.href = targetUrl;
        }
    });
    
    return button;
}

/**
 * Atualiza href do botão dinamicamente
 * @param {string} newHref - Nova URL
 */
export function updateBackButtonHref(newHref) {
    const button = document.querySelector('.back-btn');
    if (button) {
        button.href = newHref;
    }
}

export default { createBackButton, initBackButton, updateBackButtonHref };