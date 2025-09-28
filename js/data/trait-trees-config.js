// ======================
// TRAIT TREES CONFIGURATION
// ======================

export const traitTrees = {
    axe: {
        name: 'Axe',
        icon: '../assets/images/traits/axe.png',
        skills: {
            'going-big': {
                id: 'going-big',
                name: 'Going Big',
                tier: 1,
                position: { x: 50, y: 80 },
                maxLevel: 5,
                currentLevel: 0,
                levelRequirements: [1, 4, 8, 14, 20],
                description: 'Large weapons deal extra damage',
                effect: '20% extra damage at max level',
                requires: [],
                type: 'base',
                icon: '../assets/images/skills/axe/going_big.png'
            },
            'steady-bloodflow': {
                id: 'steady-bloodflow',
                name: 'Steady Bloodflow',
                tier: 2,
                position: { x: 30, y: 65 },
                maxLevel: 3,
                currentLevel: 0,
                levelRequirements: [4, 7, 12],
                description: 'Casting spells with health regenerates mana',
                effect: '+12 mana at max level',
                requires: ['going-big:1'],
                type: 'normal',
                icon: '../assets/images/skills/axe/steady_bloodflow.png'
            },
            'wrecking-it': {
                id: 'wrecking-it',
                name: 'Wrecking It',
                tier: 2,
                position: { x: 70, y: 65 },
                maxLevel: 3,
                currentLevel: 0,
                levelRequirements: [4, 8, 14],
                description: 'Blade/Physical spell buffs next attack\'s True Damage',
                effect: '+14 damage at max level',
                requires: ['steady-bloodflow:1'],
                type: 'normal',
                icon: '../assets/images/skills/axe/wrecking_it.png'
            },
            'berserker': {
                id: 'berserker',
                name: 'Berserker',
                tier: 3,
                position: { x: 15, y: 45 },
                maxLevel: 3,
                currentLevel: 0,
                levelRequirements: [5, 8, 13],
                description: 'Below 66% health grants extra damage',
                effect: '+13 damage at max level',
                requires: ['steady-bloodflow:1'],
                type: 'normal',
                icon: '../assets/images/skills/axe/berserker.png'
            },
            'overwhelming-force': {
                id: 'overwhelming-force',
                name: 'Overwhelming Force',
                tier: 4,
                position: { x: 25, y: 20 },
                maxLevel: 1,
                currentLevel: 0,
                levelRequirements: ['Active'],
                description: 'Large weapon attacks may cast area-of-effect spell',
                effect: 'Constant effect',
                requires: ['berserker:1', 'berserker:3', 'going-big:5'],
                type: 'ultimate',
                icon: '../assets/images/skills/axe/overwhelming_force.png'
            },
            'magic-blade': {
                id: 'magic-blade',
                name: 'Magic Blade',
                tier: 4,
                position: { x: 75, y: 35 },
                maxLevel: 1,
                currentLevel: 0,
                levelRequirements: ['Active'],
                description: 'Removes negatives on Large weapons; gain 10% Manaleech',
                effect: 'Constant effect',
                requires: ['wrecking-it:1', 'wrecking-it:3', 'going-big:5'],
                type: 'ultimate',
                icon: '../assets/images/skills/axe/magic_blade.png'
            },
            'unfathomable-rage': {
                id: 'unfathomable-rage',
                name: 'Unfathomable Rage',
                tier: 5,
                position: { x: 50, y: 10 },
                maxLevel: 1,
                currentLevel: 0,
                levelRequirements: ['Active'],
                description: 'Converts every 2 damage taken into 1 mana; doubles cost',
                effect: 'Constant effect',
                requires: ['magic-blade:1'],
                type: 'legendary',
                icon: '../assets/images/skills/axe/unfathomable_rage.png'
            }
        },
        connections: [
            { from: 'going-big', to: 'steady-bloodflow', type: 'normal' },
            { from: 'steady-bloodflow', to: 'berserker', type: 'normal' },
            { from: 'berserker', to: 'overwhelming-force', type: 'strong' },
            { from: 'going-big', to: 'overwhelming-force', type: 'secondary' },
            { from: 'steady-bloodflow', to: 'wrecking-it', type: 'normal' },
            { from: 'wrecking-it', to: 'magic-blade', type: 'strong' },
            { from: 'going-big', to: 'magic-blade', type: 'secondary' },
            { from: 'magic-blade', to: 'unfathomable-rage', type: 'ultimate' }
        ]
    },
    
    sword: {
        name: 'Sword',
        icon: '../assets/images/traits/sword.png',
        skills: {
            // TODO: Adicionar skills da espada
        },
        connections: []
    },
    
    staff: {
        name: 'Staff',
        icon: '../assets/images/traits/staff.png',
        skills: {
            // TODO: Adicionar skills do cajado
        },
        connections: []
    },
    
    orb: {
        name: 'Orb',
        icon: '../assets/images/traits/orb.png',
        skills: {},
        connections: []
    },
    
    shield: {
        name: 'Shield',
        icon: '../assets/images/traits/shield.png',
        skills: {},
        connections: []
    },
    
    glove: {
        name: 'Glove',
        icon: '../assets/images/traits/glove.png',
        skills: {},
        connections: []
    },
    
    bow: {
        name: 'Bow',
        icon: '../assets/images/traits/bow.png',
        skills: {},
        connections: []
    },
    
    light_armor: {
        name: 'Light Armor',
        icon: '../assets/images/traits/light_armor.png',
        skills: {},
        connections: []
    },
    
    heavy_armor: {
        name: 'Heavy Armor',
        icon: '../assets/images/traits/heavy_armor.png',
        skills: {},
        connections: []
    },
    
    dagger: {
        name: 'Dagger',
        icon: '../assets/images/traits/dagger.png',
        skills: {},
        connections: []
    }
};

// Ordem das traits para navegação
export const traitOrder = [
    'axe', 'sword', 'staff', 'orb', 'shield',
    'glove', 'bow', 'light_armor', 'heavy_armor', 'dagger'
];

// Mapeia trait para índice
export const traitIndexMap = Object.fromEntries(
    traitOrder.map((trait, index) => [trait, index])
);