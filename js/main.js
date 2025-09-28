// ======================
// MAIN - PÁGINA PRINCIPAL
// ======================
import { createStars } from './modules/stars.js';
import { initAudioSystem, stopMusic } from './modules/audio.js';
import { initTranslations, setLanguage } from './translations.js'; // Importa traduções
import { handleImageErrors, navigateToPage } from './modules/utilities.js';

// ======================
// SELEÇÃO DE CLASSES
// ======================
function initClassSelection() {
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            
            const selectedClass = this.dataset.class;
            console.log(`Navegando para simulador da classe: ${selectedClass}`);
            
            // Para a música se estiver tocando
            stopMusic();
            
            // Navega para o simulador
            navigateToPage('pages/stats-simulator.html', { class: selectedClass });
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// ======================
// INICIALIZAÇÃO 
// ======================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa componentes compartilhados
    createStars();
    initAudioSystem();
    handleImageErrors();
    
    // Inicializa sistema de traduções - IMPORTANTE
    initTranslations();
    
    // Garante que os botões de idioma funcionem
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.dataset.lang;
            setLanguage(lang);
            console.log('Idioma alterado para:', lang);
        });
    });
    
    // Inicializa funcionalidades específicas da página
    initClassSelection();
    
    console.log('Página index inicializada com sucesso');
});