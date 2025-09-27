// ======================
// CONFIGURAÇÃO DE STATS
// ======================

// Multiplicadores de Classe
export const classMultipliers = {
    squire: {
        skill: 1.00, magic: 1.00, armor: 1.00, defense: 1.00,
        health: 1.00, mana: 1.00, capacity: 1.00, hpRegen: 1.00,
        mpRegen: 1.00, attackSpeed: 1.00, damage: 1.00, movespeed: 1.00,
        ability: 1.00, range: 1.00
    },
    knight: {
        skill: 1.25, magic: 0.50, armor: 1.50, defense: 1.50,
        health: 2.00, mana: 0.50, capacity: 1.50, hpRegen: 1.25,
        mpRegen: 0.50, attackSpeed: 1.00, damage: 1.00, movespeed: 1.00,
        ability: 1.25, range: 1.00
    },
    mage: {
        skill: 0.75, magic: 2.00, armor: 0.75, defense: 0.75,
        health: 0.75, mana: 2.00, capacity: 0.75, hpRegen: 0.75,
        mpRegen: 2.00, attackSpeed: 1.00, damage: 1.00, movespeed: 1.00,
        ability: 1.00, range: 1.00
    },
    rogue: {
        skill: 1.50, magic: 1.50, armor: 1.00, defense: 1.00,
        health: 1.00, mana: 1.25, capacity: 1.00, hpRegen: 1.00,
        mpRegen: 1.00, attackSpeed: 1.25, damage: 1.00, movespeed: 1.00,
        ability: 1.00, range: 1.00
    }
};

// Base Stats
export const baseStats = {
    health: { 
        key: 'health', 
        base: 150, 
        points: 0, 
        editable: true,
        formula: (points) => points * 5
    },
    mana: { 
        key: 'mana', 
        base: 15, 
        points: 0, 
        editable: true,
        formula: (points) => points * 5
    },
    magic: { 
        key: 'magic', 
        base: 0, 
        points: 0, 
        editable: true,
        formula: (points) => points * 1
    },
    damage: { 
        key: 'damage', 
        base: 0, 
        points: 0, 
        editable: false 
    },
    movespeed: { 
        key: 'movespeed', 
        base: 35, 
        points: 0, 
        editable: false 
    },
    ability: { 
        key: 'ability', 
        base: 0, 
        points: 0, 
        editable: true,
        formula: (points) => points * 1
    },
    skill: { 
        key: 'skill', 
        base: 0, 
        points: 0, 
        editable: false 
    },
    attackSpeed: { 
        key: 'attackSpeed', 
        base: 10, 
        points: 0, 
        editable: false 
    },
    hpRegen: { 
        key: 'hpRegen', 
        base: 1, 
        points: 0, 
        editable: true,
        formula: (points) => points * 1
    },
    mpRegen: { 
        key: 'mpRegen', 
        base: 1, 
        points: 0, 
        editable: true,
        formula: (points) => points * 1
    },
    range: { 
        key: 'range', 
        base: 15, 
        points: 0, 
        editable: false 
    },
    armor: { 
        key: 'armor', 
        base: 0, 
        points: 0, 
        editable: false 
    },
    defense: { 
        key: 'defense', 
        base: 0, 
        points: 0, 
        editable: false 
    },
    capacity: { 
        key: 'capacity', 
        base: 225, 
        points: 0, 
        editable: true,
        formula: (points) => points * 25
    }
};

// Configurações do Jogo
export const gameConfig = {
    maxLevel: 100,
    minLevel: 1,
    pointsPerLevel: 3,
    maxStars: 150,
    audioVolume: 0.3
};