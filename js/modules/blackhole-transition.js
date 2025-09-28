// ======================
// BLACKHOLE TRANSITION MODULE - MP4 ONLY VERSION
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
            <div class="blackhole-wrapper">
                <video class="blackhole-video" id="blackholeVideo" loop muted playsinline>
                    <source src="../assets/videos/blackhole.mp4" type="video/mp4">
                </video>
            </div>
        `;
        document.body.appendChild(container);
        
        // Pre-carrega o vídeo
        const video = document.getElementById('blackholeVideo');
        if (video) {
            video.load();
        }
    }
    
    async execute(targetUrl) {
        if (this.transitioning) return;
        this.transitioning = true;
        
        const container = document.querySelector('.blackhole-container');
        const stars = document.querySelector('.stars-container');
        const video = document.getElementById('blackholeVideo');
        
        // SIMPLIFICADO: Pega TODOS elementos visíveis, exceto o próprio buraco negro
        const elementsToSuck = Array.from(
            document.querySelectorAll('body > *:not(.blackhole-container):not(.stars-container):not(script):not(style)')
        );
        
        // Adiciona elementos dentro de main-content se não foram pegos
        const mainContentElements = Array.from(
            document.querySelectorAll('.main-content > *, .main-content')
        );
        
        // Combina todos, removendo duplicatas
        const allElements = [...new Set([...elementsToSuck, ...mainContentElements])];
        
        console.log('Total de elementos para sugar:', allElements.length);
        
        // Calcula o centro da tela
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Fase 1: Ativa o buraco negro e inicia vídeo
        container.classList.add('active');
        
        if (video) {
            video.currentTime = 0;
            video.play().catch(e => {
                console.log('Erro ao reproduzir vídeo:', e);
            });
        }
        
        // Fase 2: Distorce o espaço
        if (stars) {
            stars.classList.add('space-warping');
        }
        
        // Fase 3: Suga todos os elementos para o centro
        allElements.forEach((element, index) => {
            if (!element || element === container || element === stars) return;
            
            const rect = element.getBoundingClientRect();
            const elementX = rect.left + rect.width / 2;
            const elementY = rect.top + rect.height / 2;
            
            // Calcula direção e distância do centro
            const deltaX = centerX - elementX;
            const deltaY = centerY - elementY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            // Aplica a animação com delay baseado na distância
            const delay = Math.min((distance / 1000) * 200, 400);
            
            setTimeout(() => {
                // Salva position original
                const originalPosition = window.getComputedStyle(element).position;
                
                // Para elementos fixed, ajusta o cálculo
                if (originalPosition === 'fixed') {
                    element.style.transformOrigin = 'center';
                } else {
                    // Adiciona classe para elementos não-fixed
                    element.classList.add('being-sucked');
                }
                
                element.style.transition = 'all 1.2s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
                element.style.transform = `
                    translate(${deltaX}px, ${deltaY}px) 
                    rotate(${540 + index * 30}deg) 
                    scale(0)
                `;
                element.style.opacity = '0';
                element.style.filter = 'blur(5px)';
                element.style.pointerEvents = 'none'; // Previne cliques durante animação
            }, delay);
        });
        
        // Fase 4: Intensifica o efeito
        setTimeout(() => {
            container.classList.add('collapsing');
        }, 1500);
        
        // Fase 5: Flash e navegação
        setTimeout(() => {
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