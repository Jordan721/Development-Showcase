// THW - Sprite Definitions
// Pixel art sprites drawn via Canvas API

const SPRITES = {
    // Color palette
    colors: {
        transparent: 'transparent',
        black: '#0f0f1a',
        darkGray: '#1a1a2e',
        gray: '#2a2a4a',
        lightGray: '#4a4a6a',
        white: '#ffffff',
        player: '#4ade80',
        playerDark: '#22c55e',
        playerLight: '#86efac',
        enemy: '#e94560',
        enemyDark: '#be123c',
        enemyLight: '#fb7185',
        projectile: '#fbbf24',
        projectileDark: '#d97706',
        trap: '#a855f7',
        trapDark: '#7c3aed',
        checkpoint: '#00d4ff',
        checkpointDark: '#0891b2',
        brick: '#8b5a2b',
        brickDark: '#5c3a1a',
        brickLight: '#a0704a',
    },

    // Sprite pixel data (1 = color, 0 = transparent)
    // Each sprite is defined as a 2D array with color indices

    player: {
        idle: [
            '....GGGG....',
            '...GGGGGG...',
            '...GWWWWG...',
            '...GWBBWG...',
            '...GWWWWG...',
            '....GGGG....',
            '...GGGGGG...',
            '..GGGGGGGG..',
            '..GG.GG.GG..',
            '..GG.GG.GG..',
            '.GGG.GG.GGG.',
            '.GG..GG..GG.',
            '....GGGG....',
            '...GG..GG...',
            '..GG....GG..',
            '.GG......GG.',
        ],
        run1: [
            '....GGGG....',
            '...GGGGGG...',
            '...GWWWWG...',
            '...GWBBWG...',
            '...GWWWWG...',
            '....GGGG....',
            '...GGGGGG...',
            '..GGGGGGGG..',
            '..GG.GG.GG..',
            '..GG.GG.GG..',
            '.GGG.GG.GGG.',
            '.GG..GG..GG.',
            '..GGGGGG....',
            '...GG..GG...',
            '....GG..GG..',
            '.....GG.....',
        ],
        run2: [
            '....GGGG....',
            '...GGGGGG...',
            '...GWWWWG...',
            '...GWBBWG...',
            '...GWWWWG...',
            '....GGGG....',
            '...GGGGGG...',
            '..GGGGGGGG..',
            '..GG.GG.GG..',
            '..GG.GG.GG..',
            '.GGG.GG.GGG.',
            '.GG..GG..GG.',
            '....GGGGGG..',
            '...GG..GG...',
            '..GG..GG....',
            '.....GG.....',
        ],
        jump: [
            '....GGGG....',
            '...GGGGGG...',
            '...GWWWWG...',
            '...GWBBWG...',
            '...GWWWWG...',
            '....GGGG....',
            '..GGGGGGGG..',
            '.GGGGGGGGGG.',
            '.GGG.GG.GGG.',
            '..GG.GG.GG..',
            '..GG.GG.GG..',
            '...GGGGGG...',
            '..GG....GG..',
            '.GG......GG.',
            'GG........GG',
            '............',
        ],
        dash: [
            '............',
            '....GGGG....',
            '...GGGGGGGG.',
            '..GWWWWGGGG.',
            '..GWBBWGGGG.',
            '..GWWWWGGGG.',
            '...GGGGGGGG.',
            '..GGGGGGGG..',
            '.GGGGGGGGG..',
            '.GGG.GG.GG..',
            '..GG.GG.....',
            '..GGGGGG....',
            '............',
            '............',
            '............',
            '............',
        ],
    },

    // Simple enemy - skull-like
    enemyBasic: [
        '....RRRR....',
        '..RRRRRRRR..',
        '.RRRRRRRRRR.',
        '.RRwRRRRwRR.',
        '.RRBBRRBBrR.',
        '.RRRRRRRRRR.',
        '.RR.RRRR.RR.',
        '.RR.R..R.RR.',
        '..RRRRRRRR..',
        '...R.RR.R...',
        '....RRRR....',
        '............',
    ],

    // Turret
    turret: [
        '....LLLL....',
        '...LLLLLL...',
        '..LLLLLLLL..',
        '..LL.LL.LL..',
        '..LLLLLLLL..',
        '...LLLLLL...',
        'LLLLLLLLLLLL',
        'LGGLLLLLLLGL',
        'LGGLLLLLLLGL',
        'LLLLLLLLLLLL',
        '..LLLLLLLL..',
        '..LL....LL..',
    ],

    // Boss eye
    bossEye: {
        open: [
            '........WWWWWWWW........',
            '......WWWWWWWWWWWW......',
            '....WWWWWWWWWWWWWWWW....',
            '...WWWWWWRRRRRRWWWWWW...',
            '..WWWWWRRRRRRRRRRWWWWW..',
            '.WWWWWRRRRRRRRRRRRRWWWW.',
            '.WWWWRRRRRRBBRRRRRRWWWW.',
            'WWWWWRRRRRRBBRRRRRRWWWWW',
            'WWWWWRRRRRRRRRRRRRRWWWWW',
            '.WWWWRRRRRRRRRRRRRRWWWW.',
            '.WWWWWRRRRRRRRRRRRRWWWW.',
            '..WWWWWRRRRRRRRRRWWWWW..',
            '...WWWWWWRRRRRRWWWWWW...',
            '....WWWWWWWWWWWWWWWW....',
            '......WWWWWWWWWWWW......',
            '........WWWWWWWW........',
        ],
        angry: [
            '........RRRRRRRR........',
            '......RRRRRRRRRRRR......',
            '....RRRRRRRRRRRRRRRR....',
            '...RRRRRRRRRRRRRRRRRRR..',
            '..RRRRRRRRRBBRRRRRRRRR..',
            '.RRRRRRRRRBBBBRRRRRRRRR.',
            '.RRRRRRRRRBBBBRRRRRRRRR.',
            'RRRRRRRRRRRBBRRRRRRRRRRR',
            'RRRRRRRRRRRRRRRRRRRRRRR.',
            '.RRRRRRRRRRRRRRRRRRRRRR.',
            '.RRRRRRRRRRRRRRRRRRRRR..',
            '..RRRRRRRRRRRRRRRRRRR...',
            '...RRRRRRRRRRRRRRRRRR...',
            '....RRRRRRRRRRRRRRRR....',
            '......RRRRRRRRRRRR......',
            '........RRRRRRRR........',
        ],
    },

    // Tiles
    tiles: {
        brick: [
            'BBBBBBBBLLLLBBBB',
            'BBBBBBBBLLLLBBBB',
            'BBBBBBBBddddBBBB',
            'dddddddddddddddd',
            'LLLLBBBBBBBBBBBB',
            'LLLLBBBBBBBBBBBB',
            'ddddBBBBBBBBBBBB',
            'dddddddddddddddd',
            'BBBBBBBBLLLLBBBB',
            'BBBBBBBBLLLLBBBB',
            'BBBBBBBBddddBBBB',
            'dddddddddddddddd',
            'LLLLBBBBBBBBBBBB',
            'LLLLBBBBBBBBBBBB',
            'ddddBBBBBBBBBBBB',
            'dddddddddddddddd',
        ],
        spike: [
            '................',
            '......LL........',
            '......LL........',
            '.....LLLL.......',
            '.....LLLL.......',
            '....LLLLLL......',
            '....LLLLLL......',
            '...LLLLLLLL.....',
            '..LL..LLLLLL....',
            '..LL..LLLLLL....',
            '.LL....LLLLLL...',
            '.LL....LLLLLL...',
            'LL......LLLLLL..',
            'LL......LLLLLL..',
            'LLLLLLLLLLLLLLLL',
            'LLLLLLLLLLLLLLLL',
        ],
        checkpoint: [
            '......CCCC......',
            '......CCCC......',
            '......CCCC......',
            '......CCCC......',
            '......CCCC......',
            '......CCCC......',
            '......CCCC......',
            '......CCCC......',
            '......CCCC......',
            '......CCCC......',
            '....CCCCCCCC....',
            '..CCCCCCCCCCCC..',
            'CCCCCCCCCCCCCCCC',
            '..CCCCCCCCCCCC..',
            '....CCCCCCCC....',
            '................',
        ],
        fakeCheckpoint: [
            '......PPPP......',
            '......PPPP......',
            '......PPPP......',
            '......PPPP......',
            '......PPPP......',
            '......PPPP......',
            '......PPPP......',
            '......PPPP......',
            '......PPPP......',
            '......PPPP......',
            '....PPPPPPPP....',
            '..PPPPPPPPPPPP..',
            'PPPPPPPPPPPPPPPP',
            '..PPPPPPPPPPPP..',
            '....PPPPPPPP....',
            '................',
        ],
        platform: [
            'LLLLLLLLLLLLLLLL',
            'LGGGGGGGGGGGGGGL',
            'LGGGGGGGGGGGGGGL',
            'LLLLLLLLLLLLLLLL',
        ],
        crumblePlatform: [
            'dddddddddddddddd',
            'dGGGGGGGGGGGGGGd',
            'dGGGGGGGGGGGGGGd',
            'dddddddddddddddd',
        ],
    },

    // Projectiles
    projectiles: {
        playerBullet: [
            '.YY.',
            'YYYY',
            'YYYY',
            '.YY.',
        ],
        enemyBullet: [
            '.RR.',
            'RRRR',
            'RRRR',
            '.RR.',
        ],
        bossTear: [
            '..CC..',
            '.CCCC.',
            'CCCCCC',
            'CCCCCC',
            '.CCCC.',
            '..CC..',
        ],
    },

    // Particles
    particles: {
        explosion: ['R', 'Y', 'W'],
        dust: ['L', 'G'],
        spark: ['Y', 'W'],
    },

    // Items
    items: {
        health: [
            '..RR..RR..',
            '.RRRRRRRR.',
            'RRRRRRRRRR',
            'RRRRRRRRRR',
            '.RRRRRRRR.',
            '..RRRRRR..',
            '...RRRR...',
            '....RR....',
        ],
        fakeHealth: [
            '..PP..PP..',
            '.PPPPPPPP.',
            'PPPPPPPPPP',
            'PPPPPPPPPP',
            '.PPPPPPPP.',
            '..PPPPPP..',
            '...PPPP...',
            '....PP....',
        ],
    },
};

// Color mapping for sprite rendering
const COLOR_MAP = {
    '.': 'transparent',
    'G': SPRITES.colors.player,
    'g': SPRITES.colors.playerDark,
    'R': SPRITES.colors.enemy,
    'r': SPRITES.colors.enemyDark,
    'Y': SPRITES.colors.projectile,
    'y': SPRITES.colors.projectileDark,
    'P': SPRITES.colors.trap,
    'p': SPRITES.colors.trapDark,
    'C': SPRITES.colors.checkpoint,
    'c': SPRITES.colors.checkpointDark,
    'B': SPRITES.colors.brick,
    'b': SPRITES.colors.brickLight,
    'd': SPRITES.colors.brickDark,
    'L': SPRITES.colors.lightGray,
    'l': SPRITES.colors.gray,
    'W': SPRITES.colors.white,
    'w': '#cccccc',
};

// Sprite rendering utility
class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.cache = new Map();
    }

    // Render a sprite at position with optional scale and flip
    draw(spriteData, x, y, scale = 1, flipX = false, flipY = false) {
        const cacheKey = `${JSON.stringify(spriteData)}_${scale}_${flipX}_${flipY}`;

        let imageData = this.cache.get(cacheKey);
        if (!imageData) {
            imageData = this.createSpriteImage(spriteData, scale, flipX, flipY);
            this.cache.set(cacheKey, imageData);
        }

        this.ctx.drawImage(imageData, Math.floor(x), Math.floor(y));
    }

    // Create an offscreen canvas with the sprite
    createSpriteImage(spriteData, scale, flipX, flipY) {
        const height = spriteData.length;
        const width = spriteData[0].length;

        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = false;

        for (let row = 0; row < height; row++) {
            for (let col = 0; col < width; col++) {
                const char = spriteData[row][col];
                const color = COLOR_MAP[char];

                if (color && color !== 'transparent') {
                    ctx.fillStyle = color;

                    const drawX = flipX ? (width - 1 - col) * scale : col * scale;
                    const drawY = flipY ? (height - 1 - row) * scale : row * scale;

                    ctx.fillRect(drawX, drawY, scale, scale);
                }
            }
        }

        return canvas;
    }

    // Draw animated sprite
    drawAnimated(frames, frameIndex, x, y, scale = 1, flipX = false) {
        const frame = frames[frameIndex % frames.length];
        this.draw(frame, x, y, scale, flipX);
    }

    // Draw a simple rectangle (for collision debugging)
    drawRect(x, y, w, h, color, filled = true) {
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = color;
        if (filled) {
            this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
        } else {
            this.ctx.strokeRect(Math.floor(x), Math.floor(y), w, h);
        }
    }

    // Draw particles
    drawParticle(x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
    }

    // Clear cache (useful when changing scale)
    clearCache() {
        this.cache.clear();
    }
}

// Export for use in game
window.SPRITES = SPRITES;
window.COLOR_MAP = COLOR_MAP;
window.SpriteRenderer = SpriteRenderer;
