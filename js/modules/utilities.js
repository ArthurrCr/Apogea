// ======================
// MÓDULO DE UTILITÁRIOS
// ======================

// Tratamento de erros de imagem
export function handleImageErrors() {
    // Class images
    document.querySelectorAll('.class-image img').forEach(img => {
        img.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = `
                <div style="color: #666; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-size: 0.6rem;">Image not found</div>
                </div>
            `;
        };
    });
    
    // Game logo
    const logoImg = document.querySelector('.game-logo img');
    if (logoImg) {
        logoImg.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = `
                <h1 style="
                    font-size: 2rem; 
                    color: #fff; 
                    text-shadow: 
                        0 0 20px rgba(255, 255, 255, 0.5),
                        2px 2px 0 #333;
                    margin: 0;
                    font-family: 'Press Start 2P', cursive;
                ">APOGEA</h1>
            `;
        };
    }
}

// Obtém parâmetro da URL
export function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Navega para página com parâmetros
export function navigateToPage(url, params = {}) {
    const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
    
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    window.location.href = fullUrl;
}

// Adiciona animação de entrada a elementos
export function addEntryAnimation(selector, delay = 0) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        el.style.animationDelay = `${delay + (index * 0.1)}s`;
        el.classList.add('fade-in');
    });
}

// Debounce para funções
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Formata número com separador
export function formatNumber(num, decimals = 0) {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Clamp de valor entre min e max
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}