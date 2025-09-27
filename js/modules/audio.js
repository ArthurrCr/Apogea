// ======================
// MÓDULO DE ÁUDIO
// ======================
let audioContext = null;
let musicStarted = false;

export function initAudioSystem() {
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
            if (visualizer) visualizer.classList.add('active');
            localStorage.setItem('musicEnabled', 'true');
        }).catch(error => {
            console.log('Autoplay prevented:', error);
        });
    }
    
    // Função para pausar música
    function pauseMusic() {
        bgMusic.pause();
        audioBtn.classList.remove('playing');
        audioBtn.classList.add('paused');
        if (visualizer) visualizer.classList.remove('active');
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
    
    return { startMusic, pauseMusic };
}

export function stopMusic() {
    const bgMusic = document.getElementById('bgMusic');
    if (bgMusic && !bgMusic.paused) {
        bgMusic.pause();
        const audioBtn = document.getElementById('audioToggle');
        const visualizer = document.querySelector('.audio-visualizer');
        if (audioBtn) {
            audioBtn.classList.remove('playing');
            audioBtn.classList.add('paused');
        }
        if (visualizer) {
            visualizer.classList.remove('active');
        }
    }
}