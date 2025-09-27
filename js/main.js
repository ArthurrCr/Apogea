// ======================
// MAIN - PÁGINA PRINCIPAL
// ======================
import { createStars } from './modules/stars.js';
import { initAudioSystem, stopMusic } from './modules/audio.js';
import { initLanguageSelector } from './modules/language.js';
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
    initLanguageSelector();
    handleImageErrors();
    
    // Inicializa funcionalidades específicas da página
    initClassSelection();
});