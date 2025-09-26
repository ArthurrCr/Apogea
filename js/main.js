// ======================
// SISTEMA DE ESTRELAS
// ======================
function createStars() {
    const starsContainer = document.getElementById('stars');
    const numberOfStars = 150;
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        const size = Math.random();
        if (size < 0.5) {
            star.classList.add('small');
        } else if (size < 0.8) {
            star.classList.add('medium');
        } else {
            star.classList.add('large');
        }
        
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (Math.random() * 3 + 3) + 's';
        
        starsContainer.appendChild(star);
    }
}

// ======================
// SELEÇÃO DE CLASSES
// ======================
function initClassSelection() {
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', function() {
            const selectedClass = this.dataset.class;
            const className = this.querySelector('.class-name').textContent;
            
            // Using translation system
            console.log(`${t('selected')}: ${className}`);
            
            // Future navigation
            // window.location.href = `/pages/${selectedClass}.html`;
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
}

// ======================
// TRATAMENTO DE ERROS
// ======================
function handleImageErrors() {
    // Class images
    document.querySelectorAll('.class-image img').forEach(img => {
        img.onerror = function() {
            this.style.display = 'none';
            this.parentElement.innerHTML = `
                <div style="color: #666; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-size: 0.6rem;">${t('error.imageNotFound')}</div>
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
                ">${t('error.logoFallback')}</h1>
            `;
        };
    }
}

// ======================
// INICIALIZAÇÃO
// ======================
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    initClassSelection();
    
    // Wait for translations to load
    setTimeout(() => {
        handleImageErrors();
    }, 100);
});

// ======================
// SISTEMA DE ÁUDIO
// ======================
let audioContext = null;
let musicStarted = false;

function initAudioSystem() {
    const bgMusic = document.getElementById('bgMusic');
    const audioBtn = document.getElementById('audioToggle');
    const visualizer = document.querySelector('.audio-visualizer');
    
    if (!bgMusic || !audioBtn) return;
    
    // Configurações iniciais
    bgMusic.volume = 0.3;
    audioBtn.classList.add('paused');
    
    // Função para iniciar música
    function startMusic() {
        if (!musicStarted) {
            bgMusic.load();
            musicStarted = true;
        }
        
        bgMusic.play().then(() => {
            audioBtn.classList.remove('paused');
            audioBtn.classList.add('playing');
            visualizer.classList.add('active');
            localStorage.setItem('musicEnabled', 'true');
        }).catch(error => {
            console.log('Autoplay prevented:', error);
        });
    }
    
    // Função para pausar música E ATUALIZAR ÍCONE
    function pauseMusic() {
        bgMusic.pause();
        audioBtn.classList.remove('playing');
        audioBtn.classList.add('paused');
        visualizer.classList.remove('active');
        localStorage.setItem('musicEnabled', 'false');
    }
    
    // Toggle música
    audioBtn.addEventListener('click', () => {
        if (bgMusic.paused) {
            startMusic();
        } else {
            pauseMusic();
        }
    });
    
    // Fade out ao clicar em classe - CORRIGIDO
    function fadeOutMusic() {
        let volume = bgMusic.volume;
        const fadeOut = setInterval(() => {
            if (volume > 0.05) {
                volume -= 0.05;
                bgMusic.volume = volume;
            } else {
                clearInterval(fadeOut);
                bgMusic.pause();
                bgMusic.volume = 0.3; // Reseta o volume para próxima vez
                
                // ATUALIZA O ÍCONE E VISUALIZADOR
                audioBtn.classList.remove('playing');
                audioBtn.classList.add('paused');
                visualizer.classList.remove('active');
            }
        }, 50);
    }
    
    // Click nas classes
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', () => {
            if (!bgMusic.paused) {
                fadeOutMusic(); // Agora atualiza o ícone também
            }
            
            // Por enquanto, só loga - depois vai navegar
            const selectedClass = card.dataset.class;
            console.log(`Classe selecionada: ${selectedClass}`);
            
            // Futuro: window.location.href = `/pages/${selectedClass}.html`;
        });
    });
    
    // Auto-start baseado na preferência
    const musicPref = localStorage.getItem('musicEnabled');
    if (musicPref === 'true') {
        document.addEventListener('click', function startOnInteraction() {
            if (bgMusic.paused && musicPref === 'true') {
                startMusic();
                document.removeEventListener('click', startOnInteraction);
            }
        });
    }
}

// Adiciona a inicialização do sistema de áudio
document.addEventListener('DOMContentLoaded', function() {
    createStars();
    initClassSelection();
    handleImageErrors();
    initAudioSystem(); // Nova linha
});