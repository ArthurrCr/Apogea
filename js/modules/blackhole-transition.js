// ======================
// BLACKHOLE TRANSITION MODULE
// ======================

export class BlackholeTransition {
    constructor() {
        this.transitioning = false;
        this.init();
    }
    
    init() {
        // Cria o container da transição uma vez
        if (!document.querySelector('.blackhole-container')) {
            this.createBlackhole();
        }
    }
    
    createBlackhole() {
        const container = document.createElement('div');
        container.className = 'blackhole-container';
        container.innerHTML = `
            <div class="blackhole">
                <div class="event-horizon"></div>
                <div class="accretion-disk"></div>
                <div class="gravitational-ring ring-1"></div>
                <div class="gravitational-ring ring-2"></div>
                <div class="gravitational-ring ring-3"></div>
                <div class="space-distortion"></div>
            </div>
        `;
        document.body.appendChild(container);
    }
    
    async execute(targetUrl) {
        if (this.transitioning) return;
        this.transitioning = true;
        
        const container = document.querySelector('.blackhole-container');
        const mainContent = document.querySelector('.main-content');
        const stars = document.querySelector('.stars-container');
        const allElements = document.querySelectorAll('.main-content > *');
        
        // Calcula o centro da tela
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Fase 1: Ativa o buraco negro
        container.classList.add('active');
        
        // Fase 2: Distorce o espaço-tempo
        if (stars) {
            stars.classList.add('space-warping');
        }
        
        // Fase 3: Suga todos os elementos para o centro
        allElements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const elementX = rect.left + rect.width / 2;
            const elementY = rect.top + rect.height / 2;
            
            // Calcula direção e distância do centro
            const deltaX = centerX - elementX;
            const deltaY = centerY - elementY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Aplica a animação com delay baseado na distância
            const delay = (distance / 1000) * 200;
            
            setTimeout(() => {
                element.style.transition = 'all 1.5s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
                element.style.transform = `
                    translate(${deltaX}px, ${deltaY}px) 
                    rotate(${720 + index * 45}deg) 
                    scale(0)
                `;
                element.style.opacity = '0';
            }, delay);
        });
        
        // Fase 4: Colapso final
        setTimeout(() => {
            mainContent.style.transition = 'all 0.8s ease-in';
            mainContent.style.transform = 'scale(0) rotate(1080deg)';
            mainContent.style.opacity = '0';
        }, 800);
        
        // Fase 5: Flash e navegação
        setTimeout(() => {
            container.classList.add('collapsing');
            
            // Cria flash branco
            const flash = document.createElement('div');
            flash.className = 'singularity-flash';
            document.body.appendChild(flash);
            
            // Navega após o flash
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 300);
        }, 2000);
    }
}

// Exporta uma instância única
export const blackholeTransition = new BlackholeTransition();