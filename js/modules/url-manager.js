// ======================
// URL MANAGER - Centraliza manipulação de URLs
// ======================

class URLManager {
    constructor() {
        this.params = new URLSearchParams(window.location.search);
    }
    
    /**
     * Obtém um parâmetro da URL
     * @param {string} name - Nome do parâmetro
     * @param {*} defaultValue - Valor padrão se não existir
     * @returns {string|null}
     */
    get(name, defaultValue = null) {
        return this.params.get(name) || defaultValue;
    }
    
    /**
     * Define um parâmetro
     * @param {string} name - Nome do parâmetro
     * @param {string} value - Valor do parâmetro
     * @param {boolean} updateURL - Atualizar URL do navegador
     */
    set(name, value, updateURL = false) {
        this.params.set(name, value);
        
        if (updateURL) {
            this.updateBrowserURL();
        }
    }
    
    /**
     * Remove um parâmetro
     * @param {string} name - Nome do parâmetro
     * @param {boolean} updateURL - Atualizar URL do navegador
     */
    delete(name, updateURL = false) {
        this.params.delete(name);
        
        if (updateURL) {
            this.updateBrowserURL();
        }
    }
    
    /**
     * Verifica se parâmetro existe
     * @param {string} name - Nome do parâmetro
     * @returns {boolean}
     */
    has(name) {
        return this.params.has(name);
    }
    
    /**
     * Obtém todos os parâmetros como objeto
     * @returns {Object}
     */
    getAll() {
        const obj = {};
        for (const [key, value] of this.params.entries()) {
            obj[key] = value;
        }
        return obj;
    }
    
    /**
     * Define múltiplos parâmetros
     * @param {Object} params - Objeto com parâmetros
     * @param {boolean} updateURL - Atualizar URL do navegador
     */
    setMultiple(params, updateURL = false) {
        Object.entries(params).forEach(([key, value]) => {
            this.params.set(key, value);
        });
        
        if (updateURL) {
            this.updateBrowserURL();
        }
    }
    
    /**
     * Atualiza URL do navegador sem recarregar
     */
    updateBrowserURL() {
        const url = new URL(window.location);
        url.search = this.params.toString();
        window.history.replaceState({}, '', url);
    }
    
    /**
     * Constrói URL com parâmetros
     * @param {string} baseUrl - URL base
     * @param {Object} additionalParams - Parâmetros adicionais
     * @param {boolean} preserveCurrent - Preservar parâmetros atuais
     * @returns {string}
     */
    buildURL(baseUrl, additionalParams = {}, preserveCurrent = false) {
        const url = new URL(baseUrl, window.location.origin);
        
        // Preserva parâmetros atuais se solicitado
        if (preserveCurrent) {
            for (const [key, value] of this.params.entries()) {
                url.searchParams.set(key, value);
            }
        }
        
        // Adiciona novos parâmetros
        Object.entries(additionalParams).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
        
        return url.href;
    }
    
    /**
     * Navega para URL com parâmetros
     * @param {string} baseUrl - URL base
     * @param {Object} params - Parâmetros
     * @param {boolean} preserveCurrent - Preservar parâmetros atuais
     */
    navigateTo(baseUrl, params = {}, preserveCurrent = false) {
        const url = this.buildURL(baseUrl, params, preserveCurrent);
        window.location.href = url;
    }
    
    /**
     * Navega preservando parâmetros específicos
     * @param {string} baseUrl - URL base
     * @param {string[]} paramsToPreserve - Nomes dos parâmetros a preservar
     * @param {Object} additionalParams - Parâmetros adicionais
     */
    navigatePreserving(baseUrl, paramsToPreserve = [], additionalParams = {}) {
        const url = new URL(baseUrl, window.location.origin);
        
        // Preserva apenas parâmetros específicos
        paramsToPreserve.forEach(param => {
            const value = this.get(param);
            if (value) {
                url.searchParams.set(param, value);
            }
        });
        
        // Adiciona novos parâmetros
        Object.entries(additionalParams).forEach(([key, value]) => {
            url.searchParams.set(key, value);
        });
        
        window.location.href = url.href;
    }
    
    /**
     * Obtém query string
     * @returns {string}
     */
    toString() {
        return this.params.toString();
    }
    
    /**
     * Limpa todos os parâmetros
     * @param {boolean} updateURL - Atualizar URL do navegador
     */
    clear(updateURL = false) {
        this.params = new URLSearchParams();
        
        if (updateURL) {
            this.updateBrowserURL();
        }
    }
}

// Exporta instância singleton
export const urlManager = new URLManager();

// Exporta também a classe para casos especiais
export { URLManager };

// Funções helper para compatibilidade
export const getURLParameter = (name, defaultValue = null) => 
    urlManager.get(name, defaultValue);

export const setURLParameter = (name, value) => 
    urlManager.set(name, value, true);

export const buildURL = (baseUrl, params = {}) => 
    urlManager.buildURL(baseUrl, params, false);

export const navigateToPage = (url, params = {}) => 
    urlManager.navigateTo(url, params, false);

export default urlManager;