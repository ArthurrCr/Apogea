// ======================
// IMAGE LOADER - Tratamento centralizado de erros de imagem
// ======================

/**
 * Configurações padrão para fallback de imagens
 */
const DEFAULT_CONFIG = {
    showPlaceholder: true,
    placeholderIcon: '⚔️',
    placeholderText: 'Image not found',
    logErrors: true,
    retryAttempts: 1,
    retryDelay: 1000
};

/**
 * Trata erro de imagem individual
 * @param {HTMLImageElement} img - Elemento de imagem
 * @param {Object} options - Opções de configuração
 */
export function handleImageError(img, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };
    
    if (config.logErrors) {
        console.warn(`Failed to load image: ${img.src}`);
    }
    
    if (!config.showPlaceholder) {
        img.style.display = 'none';
        return;
    }
    
    // Cria placeholder
    const placeholder = createPlaceholder(
        config.placeholderIcon,
        config.placeholderText,
        img.alt
    );
    
    // Substitui imagem
    img.style.display = 'none';
    img.parentElement?.appendChild(placeholder);
}

/**
 * Cria elemento placeholder
 * @param {string} icon - Ícone do placeholder
 * @param {string} text - Texto do placeholder
 * @param {string} alt - Texto alternativo da imagem
 * @returns {HTMLElement}
 */
function createPlaceholder(icon, text, alt) {
    const container = document.createElement('div');
    container.className = 'image-placeholder';
    
    const iconEl = document.createElement('div');
    iconEl.className = 'placeholder-icon';
    iconEl.textContent = icon;
    
    const textEl = document.createElement('div');
    textEl.className = 'placeholder-text';
    textEl.textContent = alt || text;
    
    container.appendChild(iconEl);
    container.appendChild(textEl);
    
    return container;
}

/**
 * Inicializa tratamento de erro para todas as imagens
 * @param {string} selector - Seletor CSS das imagens
 * @param {Object} options - Opções de configuração
 */
export function initImageErrorHandling(selector = 'img', options = {}) {
    const images = document.querySelectorAll(selector);
    
    images.forEach(img => {
        // Remove listener existente se houver
        img.onerror = null;
        
        // Adiciona novo listener
        img.addEventListener('error', () => {
            handleImageError(img, options);
        });
    });
}

/**
 * Carrega imagem com retry
 * @param {string} src - URL da imagem
 * @param {Object} options - Opções
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageWithRetry(src, options = {}) {
    const config = { ...DEFAULT_CONFIG, ...options };
    
    return new Promise((resolve, reject) => {
        let attempts = 0;
        
        const tryLoad = () => {
            const img = new Image();
            
            img.onload = () => resolve(img);
            
            img.onerror = () => {
                attempts++;
                
                if (attempts < config.retryAttempts) {
                    if (config.logErrors) {
                        console.warn(`Retry ${attempts}/${config.retryAttempts} for: ${src}`);
                    }
                    setTimeout(tryLoad, config.retryDelay);
                } else {
                    reject(new Error(`Failed to load image after ${attempts} attempts: ${src}`));
                }
            };
            
            img.src = src;
        };
        
        tryLoad();
    });
}

/**
 * Pré-carrega múltiplas imagens
 * @param {string[]} urls - Array de URLs
 * @param {Function} onProgress - Callback de progresso
 * @returns {Promise<HTMLImageElement[]>}
 */
export async function preloadImages(urls, onProgress) {
    const total = urls.length;
    let loaded = 0;
    
    const promises = urls.map(async (url) => {
        try {
            const img = await loadImageWithRetry(url, { retryAttempts: 2 });
            loaded++;
            if (onProgress) {
                onProgress(loaded, total);
            }
            return img;
        } catch (error) {
            console.error(`Failed to preload: ${url}`, error);
            loaded++;
            if (onProgress) {
                onProgress(loaded, total);
            }
            return null;
        }
    });
    
    return Promise.all(promises);
}

/**
 * Verifica se imagem existe
 * @param {string} url - URL da imagem
 * @returns {Promise<boolean>}
 */
export async function imageExists(url) {
    try {
        await loadImageWithRetry(url, { retryAttempts: 1 });
        return true;
    } catch {
        return false;
    }
}

/**
 * Lazy loading de imagens
 * @param {string} selector - Seletor das imagens
 * @param {Object} options - Opções do IntersectionObserver
 */
export function initLazyLoading(selector = '[data-src]', options = {}) {
    const config = {
        rootMargin: '50px',
        threshold: 0.01,
        ...options
    };
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    
                    if (src) {
                        loadImageWithRetry(src)
                            .then(loadedImg => {
                                img.src = loadedImg.src;
                                img.classList.add('loaded');
                            })
                            .catch(() => {
                                handleImageError(img);
                            });
                        
                        observer.unobserve(img);
                    }
                }
            });
        }, config);
        
        document.querySelectorAll(selector).forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback para navegadores sem suporte
        document.querySelectorAll(selector).forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    }
}

/**
 * Adiciona CSS para placeholders
 */
export function injectPlaceholderStyles() {
    if (document.getElementById('image-loader-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'image-loader-styles';
    style.textContent = `
        .image-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            min-height: 60px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.3);
            font-family: 'Press Start 2P', cursive;
        }
        
        .placeholder-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
            opacity: 0.5;
        }
        
        .placeholder-text {
            font-size: 0.4rem;
            text-align: center;
            padding: 0 1rem;
        }
        
        img.loaded {
            animation: imageLoaded 0.3s ease;
        }
        
        @keyframes imageLoaded {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
    document.head.appendChild(style);
}

// Auto-injeta estilos quando módulo é importado
injectPlaceholderStyles();

export default {
    handleImageError,
    initImageErrorHandling,
    loadImageWithRetry,
    preloadImages,
    imageExists,
    initLazyLoading,
    injectPlaceholderStyles
};