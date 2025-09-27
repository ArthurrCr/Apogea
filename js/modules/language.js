// ======================
// MÓDULO DE SELETOR DE IDIOMA
// ======================
export function initLanguageSelector(onLanguageChange) {
    const buttons = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('gameLanguage') || 'en';
    
    // Define idioma inicial
    buttons.forEach(btn => {
        if (btn.dataset.lang === savedLang) {
            btn.classList.add('active');
        }
        
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            
            // Remove active de todos
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Chama função de tradução se existir
            if (typeof setLanguage !== 'undefined') {
                setLanguage(lang);
            }
            
            // Callback opcional
            if (onLanguageChange) {
                setTimeout(() => onLanguageChange(lang), 100);
            }
        });
    });
    
    return savedLang;
}