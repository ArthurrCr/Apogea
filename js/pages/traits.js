// ======================
// TRAITS PAGE - MAIN CONTROLLER
// ======================

import { createStars } from '../modules/stars.js';
import { initTranslations } from '../translations.js';
import { blackholeTransition } from '../modules/blackhole-transition.js';

class TraitsPage {
    constructor() {
        this.traitsData = [
            { id: 'axe', name: 'Axe' },
            { id: 'sword', name: 'Sword' },
            { id: 'staff', name: 'Staff' },
            { id: 'orb', name: 'Orb' },
            { id: 'shield', name: 'Shield' },
            { id: 'glove', name: 'Glove' },
            { id: 'bow', name: 'Bow' },
            { id: 'light_armor', name: 'Light Armor' },
            { id: 'heavy_armor', name: 'Heavy Armor' },
            { id: 'dagger', name: 'Dagger' }
        ];
    }
    
    init() {
        // Initialize shared components
        createStars();
        initTranslations();
        
        // Setup navigation
        this.setupTraitNavigation();
        this.setupBackButton();
        this.handleURLParams();
    }
    
    setupTraitNavigation() {
        document.querySelectorAll('.trait-block').forEach(block => {
            block.addEventListener('click', () => {
                const trait = block.dataset.trait;
                this.navigateToTree(trait);
            });
        });
    }
    
    navigateToTree(trait) {
        const urlParams = new URLSearchParams(window.location.search);
        const classParam = urlParams.get('class');
        
        let targetUrl = `trait-tree.html?trait=${trait}`;
        if (classParam) {
            targetUrl += `&class=${classParam}`;
        }
        
        window.location.href = targetUrl;
    }
    
    setupBackButton() {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                const urlParams = new URLSearchParams(window.location.search);
                const classParam = urlParams.get('class');
                
                let targetUrl = backButton.href;
                if (classParam) {
                    targetUrl += `?class=${classParam}`;
                }
                
                blackholeTransition.execute(targetUrl);
            });
        }
    }
    
    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const fromStats = urlParams.get('from');
        
        if (fromStats === 'stats') {
            console.log('Returning from stats simulator');
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const traitsPage = new TraitsPage();
    traitsPage.init();
});