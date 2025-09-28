// ======================
// TREE NAVIGATION MODULE
// ======================

export class TreeNavigation {
    constructor(containerSelector, totalTrees = 10) {
        this.container = document.querySelector(containerSelector);
        this.totalTrees = totalTrees;
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.callbacks = {};
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.setupArrowNavigation();
        this.setupDotNavigation();
        this.setupKeyboardNavigation();
        this.setupDragNavigation();
        this.setupWheelNavigation();
        this.setupResizeHandler();
    }
    
    // Navega para uma árvore específica
    navigateTo(index) {
        // Implementa loop infinito
        if (index < 0) {
            index = this.totalTrees - 1;
        } else if (index >= this.totalTrees) {
            index = 0;
        }
        
        this.currentIndex = index;
        
        // Calcula o offset
        const offset = -index * window.innerWidth;
        this.container.style.transform = `translateX(${offset}px)`;
        
        // Atualiza elementos visuais
        this.updateDots();
        this.updateArrows();
        
        // Dispara callback
        if (this.callbacks.onNavigate) {
            this.callbacks.onNavigate(index);
        }
    }
    
    // Navegação por setas
    setupArrowNavigation() {
        const leftArrow = document.getElementById('navLeft');
        const rightArrow = document.getElementById('navRight');
        
        if (leftArrow) {
            leftArrow.addEventListener('click', () => {
                this.navigateTo(this.currentIndex - 1);
            });
        }
        
        if (rightArrow) {
            rightArrow.addEventListener('click', () => {
                this.navigateTo(this.currentIndex + 1);
            });
        }
    }
    
    // Navegação por pontos
    setupDotNavigation() {
        const dots = document.querySelectorAll('.nav-dot');
        
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const index = parseInt(dot.dataset.index);
                this.navigateTo(index);
            });
        });
    }
    
    // Navegação por teclado
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigateTo(this.currentIndex - 1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateTo(this.currentIndex + 1);
            }
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (index < this.totalTrees) {
                    this.navigateTo(index);
                }
            }
            if (e.key === '0') {
                this.navigateTo(9);
            }
        });
    }
    
    // Navegação por drag/touch
    setupDragNavigation() {
        // Mouse events
        this.container.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));
        document.addEventListener('mouseleave', (e) => this.endDrag(e));
        
        // Touch events
        this.container.addEventListener('touchstart', (e) => this.startDrag(e), { passive: false });
        this.container.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        this.container.addEventListener('touchend', (e) => this.endDrag(e));
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.container.classList.add('dragging');
        this.startX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        this.currentX = this.startX;
        e.preventDefault();
    }
    
    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        this.currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].pageX;
        const diff = this.startX - this.currentX;
        
        // Mostra preview do arrasto
        const currentOffset = -this.currentIndex * window.innerWidth;
        const dragOffset = currentOffset - diff;
        this.container.style.transform = `translateX(${dragOffset}px)`;
    }
    
    endDrag(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.container.classList.remove('dragging');
        
        const diff = this.startX - this.currentX;
        const threshold = window.innerWidth / 4; // 25% da tela
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                // Arrastou para esquerda - próxima árvore
                this.navigateTo(this.currentIndex + 1);
            } else {
                // Arrastou para direita - árvore anterior
                this.navigateTo(this.currentIndex - 1);
            }
        } else {
            // Volta para posição atual se não passou do threshold
            this.navigateTo(this.currentIndex);
        }
    }
    
    // Navegação por scroll do mouse
    setupWheelNavigation() {
        let wheelTimeout;
        let accumDelta = 0;
        
        document.addEventListener('wheel', (e) => {
            // Só funciona se for scroll vertical significativo
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
            
            e.preventDefault();
            accumDelta += e.deltaY;
            
            clearTimeout(wheelTimeout);
            wheelTimeout = setTimeout(() => {
                if (Math.abs(accumDelta) > 50) {
                    if (accumDelta > 0) {
                        this.navigateTo(this.currentIndex + 1);
                    } else {
                        this.navigateTo(this.currentIndex - 1);
                    }
                }
                accumDelta = 0;
            }, 100);
        }, { passive: false });
    }
    
    // Atualiza indicadores visuais
    updateDots() {
        const dots = document.querySelectorAll('.nav-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentIndex);
        });
    }
    
    updateArrows() {
        const leftArrow = document.getElementById('navLeft');
        const rightArrow = document.getElementById('navRight');
        
        // Remove disabled já que temos loop infinito
        if (leftArrow) leftArrow.classList.remove('disabled');
        if (rightArrow) rightArrow.classList.remove('disabled');
    }
    
    // Lida com resize da janela
    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.navigateTo(this.currentIndex);
            }, 250);
        });
    }
    
    // Métodos públicos
    next() {
        this.navigateTo(this.currentIndex + 1);
    }
    
    previous() {
        this.navigateTo(this.currentIndex - 1);
    }
    
    goTo(index) {
        this.navigateTo(index);
    }
    
    getCurrentIndex() {
        return this.currentIndex;
    }
    
    // Callbacks
    onNavigate(callback) {
        this.callbacks.onNavigate = callback;
    }
}

// Exporta uma instância singleton
export const treeNavigation = new TreeNavigation('#treesContainer', 10);