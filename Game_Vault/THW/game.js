// THW - The Hard Hallway
// Main Game Engine

// ==================== CONFIGURATION ====================
const CONFIG = {
    // Display
    NATIVE_WIDTH: 320,
    NATIVE_HEIGHT: 180,
    TILE_SIZE: 16,

    // Physics
    GRAVITY: 0.5,
    MAX_FALL_SPEED: 8,
    FRICTION: 0.85,

    // Player
    PLAYER_SPEED: 2.5,
    PLAYER_JUMP_FORCE: 7,
    PLAYER_DASH_SPEED: 8,
    PLAYER_DASH_DURATION: 8,
    PLAYER_DASH_COOLDOWN: 45,
    PLAYER_SHOOT_COOLDOWN: 12,
    PLAYER_INVINCIBILITY_TIME: 60,
    PLAYER_MAX_HP: 3,
    COYOTE_TIME: 6,
    JUMP_BUFFER_TIME: 8,

    // Combat
    PLAYER_BULLET_SPEED: 6,
    ENEMY_BULLET_SPEED: 3,
};

// ==================== GAME STATE ====================
const game = {
    // Core
    canvas: null,
    ctx: null,
    spriteRenderer: null,
    running: false,
    paused: false,

    // Timing
    lastTime: 0,
    deltaTime: 0,
    frameCount: 0,

    // Level state
    currentLevel: 0,
    currentRoom: 0,
    tiles: [],
    roomWidth: 0,
    roomHeight: 0,

    // Camera
    camera: { x: 0, y: 0 },

    // Statistics
    deaths: 0,
    totalDeaths: parseInt(localStorage.getItem('thw_totalDeaths') || '0'),
    levelDeaths: 0,
    levelStartTime: 0,
    totalTime: 0,

    // Player
    player: null,

    // Entities
    enemies: [],
    projectiles: [],
    particles: [],
    traps: [],
    checkpoints: [],
    items: [],

    // Active effects
    screenShake: { active: false, intensity: 0, duration: 0 },
    screenFlash: { active: false, color: '#fff', duration: 0 },
    lightsOut: false,
    gravityFlipped: false,
    controlsMirrored: false,
    speedMultiplier: 1,

    // Boss
    boss: null,
    bossActive: false,
    doorsLocked: false,

    // Messages
    messageQueue: [],
    currentMessage: null,
    messageTimer: 0,

    // Fake victory tracking
    fakeVictoryActive: false,
    fakeVictoryTimer: 0,

    // Audio context
    audioCtx: null,
};

// ==================== PLAYER CLASS ====================
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 12;
        this.height = 16;
        this.vx = 0;
        this.vy = 0;

        this.hp = CONFIG.PLAYER_MAX_HP;
        this.invincible = false;
        this.invincibleTimer = 0;

        this.grounded = false;
        this.coyoteTimer = 0;
        this.jumpBufferTimer = 0;
        this.canDoubleJump = false;

        this.dashing = false;
        this.dashTimer = 0;
        this.dashCooldown = 0;
        this.dashDirection = 1;

        this.shootCooldown = 0;
        this.aimDirection = { x: 1, y: 0 };

        this.facingRight = true;
        this.animFrame = 0;
        this.animTimer = 0;
        this.state = 'idle'; // idle, run, jump, dash

        this.lastCheckpoint = { x: x, y: y };
    }

    update(input) {
        // Handle timers
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        if (this.invincibleTimer <= 0) this.invincible = false;
        if (this.dashCooldown > 0) this.dashCooldown--;
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.coyoteTimer > 0) this.coyoteTimer--;
        if (this.jumpBufferTimer > 0) this.jumpBufferTimer--;

        // Get input direction (potentially mirrored)
        let moveX = 0;
        if (input.left) moveX -= 1;
        if (input.right) moveX += 1;
        if (game.controlsMirrored) moveX *= -1;

        // Dashing
        if (this.dashing) {
            this.dashTimer--;
            this.vx = this.dashDirection * CONFIG.PLAYER_DASH_SPEED;
            this.vy = 0;
            if (this.dashTimer <= 0) {
                this.dashing = false;
            }
        } else {
            // Normal movement
            this.vx += moveX * CONFIG.PLAYER_SPEED * 0.3;
            this.vx *= CONFIG.FRICTION;

            // Clamp horizontal speed
            if (Math.abs(this.vx) > CONFIG.PLAYER_SPEED) {
                this.vx = Math.sign(this.vx) * CONFIG.PLAYER_SPEED;
            }
            if (Math.abs(this.vx) < 0.1) this.vx = 0;

            // Gravity
            const gravity = game.gravityFlipped ? -CONFIG.GRAVITY : CONFIG.GRAVITY;
            this.vy += gravity * game.speedMultiplier;

            // Clamp fall speed
            const maxFall = game.gravityFlipped ? -CONFIG.MAX_FALL_SPEED : CONFIG.MAX_FALL_SPEED;
            if (game.gravityFlipped) {
                if (this.vy < maxFall) this.vy = maxFall;
            } else {
                if (this.vy > maxFall) this.vy = maxFall;
            }
        }

        // Jump buffer
        if (input.jumpPressed) {
            this.jumpBufferTimer = CONFIG.JUMP_BUFFER_TIME;
        }

        // Jump
        if (this.jumpBufferTimer > 0 && (this.grounded || this.coyoteTimer > 0)) {
            const jumpForce = game.gravityFlipped ? CONFIG.PLAYER_JUMP_FORCE : -CONFIG.PLAYER_JUMP_FORCE;
            this.vy = jumpForce;
            this.grounded = false;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            playSound('jump');
        }

        // Variable jump height
        if (!input.jump && !game.gravityFlipped && this.vy < -2) {
            this.vy = -2;
        } else if (!input.jump && game.gravityFlipped && this.vy > 2) {
            this.vy = 2;
        }

        // Dash
        if (input.dashPressed && this.dashCooldown <= 0 && !this.dashing) {
            this.dashing = true;
            this.dashTimer = CONFIG.PLAYER_DASH_DURATION;
            this.dashCooldown = CONFIG.PLAYER_DASH_COOLDOWN;
            this.dashDirection = this.facingRight ? 1 : -1;
            if (moveX !== 0) this.dashDirection = moveX;
            this.invincible = true;
            this.invincibleTimer = CONFIG.PLAYER_DASH_DURATION;
            playSound('dash');
        }

        // Shooting
        if (input.shoot && this.shootCooldown <= 0) {
            this.shoot(input);
            this.shootCooldown = CONFIG.PLAYER_SHOOT_COOLDOWN;
        }

        // Update aim direction
        if (input.left || input.right || input.up || input.down) {
            this.aimDirection = { x: 0, y: 0 };
            if (input.left) this.aimDirection.x = -1;
            if (input.right) this.aimDirection.x = 1;
            if (input.up) this.aimDirection.y = -1;
            if (input.down) this.aimDirection.y = 1;
            // Normalize
            const len = Math.sqrt(this.aimDirection.x ** 2 + this.aimDirection.y ** 2);
            if (len > 0) {
                this.aimDirection.x /= len;
                this.aimDirection.y /= len;
            }
        }

        // Apply velocity
        this.x += this.vx * game.speedMultiplier;
        this.y += this.vy * game.speedMultiplier;

        // Collision detection
        this.handleCollisions();

        // Update facing direction
        if (this.vx > 0.5) this.facingRight = true;
        if (this.vx < -0.5) this.facingRight = false;

        // Update animation
        this.updateAnimation();

        // Check for death (fell out of level)
        if (this.y > game.roomHeight * CONFIG.TILE_SIZE + 50 ||
            this.y < -50 ||
            this.x < -50 ||
            this.x > game.roomWidth * CONFIG.TILE_SIZE + 50) {
            this.die();
        }
    }

    handleCollisions() {
        const wasGrounded = this.grounded;
        this.grounded = false;

        // Get tiles player might collide with
        const left = Math.floor(this.x / CONFIG.TILE_SIZE);
        const right = Math.floor((this.x + this.width) / CONFIG.TILE_SIZE);
        const top = Math.floor(this.y / CONFIG.TILE_SIZE);
        const bottom = Math.floor((this.y + this.height) / CONFIG.TILE_SIZE);

        // Check each potential collision tile
        for (let ty = top; ty <= bottom; ty++) {
            for (let tx = left; tx <= right; tx++) {
                if (ty < 0 || ty >= game.tiles.length || tx < 0 || tx >= game.tiles[0].length) continue;

                const tile = game.tiles[ty][tx];

                // Solid tiles
                if (tile.solid) {
                    const tileX = tx * CONFIG.TILE_SIZE;
                    const tileY = ty * CONFIG.TILE_SIZE;

                    // Calculate overlap
                    const overlapX = Math.min(this.x + this.width - tileX, tileX + CONFIG.TILE_SIZE - this.x);
                    const overlapY = Math.min(this.y + this.height - tileY, tileY + CONFIG.TILE_SIZE - this.y);

                    if (overlapX > 0 && overlapY > 0) {
                        // Resolve collision
                        if (overlapX < overlapY) {
                            // Horizontal collision
                            if (this.x + this.width / 2 < tileX + CONFIG.TILE_SIZE / 2) {
                                this.x = tileX - this.width;
                            } else {
                                this.x = tileX + CONFIG.TILE_SIZE;
                            }
                            this.vx = 0;
                        } else {
                            // Vertical collision
                            if (this.y + this.height / 2 < tileY + CONFIG.TILE_SIZE / 2) {
                                this.y = tileY - this.height;
                                if (!game.gravityFlipped) {
                                    this.grounded = true;
                                    this.vy = 0;
                                }
                            } else {
                                this.y = tileY + CONFIG.TILE_SIZE;
                                if (game.gravityFlipped) {
                                    this.grounded = true;
                                }
                                this.vy = 0;
                            }
                        }
                    }
                }

                // Platform tiles (one-way)
                if (tile.platform && !tile.solid) {
                    const tileY = ty * CONFIG.TILE_SIZE;
                    const playerBottom = this.y + this.height;
                    const prevBottom = playerBottom - this.vy;

                    if (!game.gravityFlipped && this.vy > 0 && prevBottom <= tileY && playerBottom >= tileY) {
                        this.y = tileY - this.height;
                        this.vy = 0;
                        this.grounded = true;
                    }
                }

                // Spikes - INSTANT DEATH
                if (tile.spike && !this.invincible && !this.dashing) {
                    const tileX = tx * CONFIG.TILE_SIZE;
                    const tileY = ty * CONFIG.TILE_SIZE;
                    if (this.checkTileCollision(tileX, tileY)) {
                        this.die(); // No mercy
                    }
                }

                // Exit
                if (tile.exit) {
                    const tileX = tx * CONFIG.TILE_SIZE;
                    const tileY = ty * CONFIG.TILE_SIZE;
                    if (this.checkTileCollision(tileX, tileY) && !game.doorsLocked) {
                        completeRoom();
                    }
                }

                // Checkpoint
                if (tile.checkpoint) {
                    const tileX = tx * CONFIG.TILE_SIZE;
                    const tileY = ty * CONFIG.TILE_SIZE;
                    if (this.checkTileCollision(tileX, tileY)) {
                        this.lastCheckpoint = { x: tileX, y: tileY - this.height + CONFIG.TILE_SIZE };
                        // Visual feedback
                        tile.activated = true;
                    }
                }

                // Boss trigger
                if (tile.bossTrigger && !game.bossActive) {
                    const tileX = tx * CONFIG.TILE_SIZE;
                    if (this.x > tileX) {
                        triggerBoss();
                    }
                }
            }
        }

        // Coyote time
        if (wasGrounded && !this.grounded) {
            this.coyoteTimer = CONFIG.COYOTE_TIME;
        }
    }

    checkTileCollision(tileX, tileY) {
        return this.x < tileX + CONFIG.TILE_SIZE &&
               this.x + this.width > tileX &&
               this.y < tileY + CONFIG.TILE_SIZE &&
               this.y + this.height > tileY;
    }

    shoot(input) {
        let dx = this.aimDirection.x;
        let dy = this.aimDirection.y;

        if (dx === 0 && dy === 0) {
            dx = this.facingRight ? 1 : -1;
        }

        const bullet = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: dx * CONFIG.PLAYER_BULLET_SPEED,
            vy: dy * CONFIG.PLAYER_BULLET_SPEED,
            width: 4,
            height: 4,
            friendly: true,
            damage: 1,
            life: 120,
        };

        game.projectiles.push(bullet);
        playSound('shoot');
    }

    takeDamage(amount) {
        if (this.invincible || this.dashing) return;

        this.hp -= amount;
        this.invincible = true;
        this.invincibleTimer = CONFIG.PLAYER_INVINCIBILITY_TIME;

        triggerScreenShake(5, 10);
        triggerScreenFlash('#e94560', 5);
        playSound('hurt');

        updateHealthDisplay();

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        game.deaths++;
        game.totalDeaths++;
        game.levelDeaths++;
        localStorage.setItem('thw_totalDeaths', game.totalDeaths.toString());

        // Particles
        for (let i = 0; i < 20; i++) {
            game.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30 + Math.random() * 30,
                color: '#4ade80',
                size: 2 + Math.random() * 2,
            });
        }

        triggerScreenShake(8, 15);
        playSound('death');

        // Show death screen briefly then respawn
        showDeathScreen();

        setTimeout(() => {
            this.respawn();
            hideDeathScreen();
        }, 800);
    }

    respawn() {
        this.x = this.lastCheckpoint.x;
        this.y = this.lastCheckpoint.y;
        this.vx = 0;
        this.vy = 0;
        this.hp = CONFIG.PLAYER_MAX_HP;
        this.invincible = true;
        this.invincibleTimer = 60;
        this.dashing = false;
        updateHealthDisplay();
        updateDeathDisplay();
    }

    updateAnimation() {
        this.animTimer++;
        if (this.animTimer >= 8) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }

        if (this.dashing) {
            this.state = 'dash';
        } else if (!this.grounded) {
            this.state = 'jump';
        } else if (Math.abs(this.vx) > 0.5) {
            this.state = 'run';
        } else {
            this.state = 'idle';
        }
    }

    draw(ctx) {
        const px = Math.floor(this.x - game.camera.x);
        const py = Math.floor(this.y - game.camera.y);

        // Flicker when invincible
        if (this.invincible && !this.dashing && Math.floor(game.frameCount / 3) % 2 === 0) {
            return;
        }

        // Body
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(px + 2, py + 4, 8, 8);
        // Head
        ctx.fillStyle = '#86efac';
        ctx.fillRect(px + 3, py, 6, 5);
        // Eyes
        ctx.fillStyle = '#000';
        if (this.facingRight) {
            ctx.fillRect(px + 6, py + 2, 2, 2);
        } else {
            ctx.fillRect(px + 4, py + 2, 2, 2);
        }
        // Legs
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(px + 2, py + 12, 3, 4);
        ctx.fillRect(px + 7, py + 12, 3, 4);
    }
}

// ==================== ENEMY CLASSES ====================
class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 16;
        this.height = 16;
        this.vx = 0;
        this.vy = 0;
        this.hp = ENEMY_BEHAVIORS[type]?.health || 1;
        this.damage = ENEMY_BEHAVIORS[type]?.damage || 1;
        this.dead = false;

        this.patrolDirection = 1;
        this.patrolStart = x;
        this.shootTimer = 0;
        this.animFrame = 0;
    }

    update() {
        if (this.dead) return;

        const behavior = ENEMY_BEHAVIORS[this.type];

        switch (this.type) {
            case 'basic':
                this.updateBasic(behavior);
                break;
            case 'turret':
                this.updateTurret(behavior);
                break;
            case 'chaser':
                this.updateChaser(behavior);
                break;
        }

        // Check collision with player
        if (this.checkPlayerCollision() && !game.player.invincible) {
            game.player.takeDamage(this.damage);
        }
    }

    updateBasic(behavior) {
        // Patrol
        this.x += this.patrolDirection * behavior.speed;
        if (Math.abs(this.x - this.patrolStart) > behavior.patrolDistance) {
            this.patrolDirection *= -1;
        }

        // Gravity
        this.vy += CONFIG.GRAVITY;
        this.y += this.vy;

        // Floor collision (simplified)
        const tileBelow = Math.floor((this.y + this.height) / CONFIG.TILE_SIZE);
        const tileX = Math.floor((this.x + this.width / 2) / CONFIG.TILE_SIZE);
        if (tileBelow < game.tiles.length && tileX < game.tiles[0].length) {
            if (game.tiles[tileBelow] && game.tiles[tileBelow][tileX]?.solid) {
                this.y = tileBelow * CONFIG.TILE_SIZE - this.height;
                this.vy = 0;
            }
        }

        // Shooting
        this.shootTimer++;
        if (this.shootTimer >= behavior.shootInterval) {
            this.shootTimer = 0;
            this.shootAtPlayer();
        }
    }

    updateTurret(behavior) {
        this.shootTimer++;
        if (this.shootTimer >= behavior.shootInterval) {
            this.shootTimer = 0;
            this.shootAtPlayer();
        }
    }

    updateChaser(behavior) {
        // Chase player
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.vx = (dx / dist) * behavior.speed;
            this.vy = (dy / dist) * behavior.speed;
        }

        this.x += this.vx;
        this.y += this.vy;
    }

    shootAtPlayer() {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0 && dist < 200) {
            const bullet = {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: (dx / dist) * CONFIG.ENEMY_BULLET_SPEED,
                vy: (dy / dist) * CONFIG.ENEMY_BULLET_SPEED,
                width: 4,
                height: 4,
                friendly: false,
                damage: 1,
                life: 180,
            };
            game.projectiles.push(bullet);
            playSound('enemyShoot');
        }
    }

    checkPlayerCollision() {
        return game.player.x < this.x + this.width &&
               game.player.x + game.player.width > this.x &&
               game.player.y < this.y + this.height &&
               game.player.y + game.player.height > this.y;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.dead = true;
        // Particles
        for (let i = 0; i < 10; i++) {
            game.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 20 + Math.random() * 20,
                color: '#e94560',
                size: 2,
            });
        }
        playSound('enemyDeath');
    }

    draw(ctx) {
        if (this.dead) return;

        const drawX = Math.floor(this.x - game.camera.x);
        const drawY = Math.floor(this.y - game.camera.y);

        if (this.type === 'turret') {
            // Turret - gray box with barrel
            ctx.fillStyle = '#4a4a6a';
            ctx.fillRect(drawX, drawY + 6, 16, 10);
            ctx.fillStyle = '#6a6a8a';
            ctx.fillRect(drawX + 2, drawY + 8, 12, 6);
            ctx.fillStyle = '#e94560';
            ctx.fillRect(drawX + 6, drawY + 2, 4, 6);
        } else {
            // Basic enemy - red skull-like
            ctx.fillStyle = '#e94560';
            ctx.fillRect(drawX + 2, drawY + 2, 12, 12);
            ctx.fillStyle = '#be123c';
            ctx.fillRect(drawX + 4, drawY + 4, 3, 3);
            ctx.fillRect(drawX + 9, drawY + 4, 3, 3);
            ctx.fillStyle = '#000';
            ctx.fillRect(drawX + 5, drawY + 5, 2, 2);
            ctx.fillRect(drawX + 10, drawY + 5, 2, 2);
            ctx.fillStyle = '#fb7185';
            ctx.fillRect(drawX + 6, drawY + 10, 4, 2);
        }
    }
}

// ==================== BOSS CLASS ====================
class Boss {
    constructor(config) {
        this.x = config.x * CONFIG.TILE_SIZE;
        this.y = config.y * CONFIG.TILE_SIZE;
        this.name = config.name;
        this.maxHp = config.health;
        this.hp = config.health;
        this.width = 48;
        this.height = 48;
        this.patterns = config.patterns;
        this.currentPattern = 0;
        this.patternTimer = 0;
        this.phase = 0;
        this.dead = false;
        this.angry = false;

        this.baseY = this.y;
        this.floatOffset = 0;
    }

    update() {
        if (this.dead) return;

        // Floating motion
        this.floatOffset += 0.05;
        this.y = this.baseY + Math.sin(this.floatOffset) * 10;

        // Check if angry (below 50% hp)
        this.angry = this.hp < this.maxHp / 2;

        // Pattern execution
        this.patternTimer++;
        const pattern = this.patterns[this.currentPattern];
        const patternData = BOSS_PATTERNS.eye[pattern];

        if (this.patternTimer >= patternData.duration) {
            this.patternTimer = 0;
            this.currentPattern = (this.currentPattern + 1) % this.patterns.length;
        }

        this.executePattern(pattern, patternData);

        // Check collision with player bullets
        game.projectiles.forEach(p => {
            if (p.friendly && !p.dead) {
                if (p.x < this.x + this.width &&
                    p.x + p.width > this.x &&
                    p.y < this.y + this.height &&
                    p.y + p.height > this.y) {
                    this.takeDamage(p.damage);
                    p.dead = true;
                }
            }
        });

        // Check collision with player
        if (game.player.x < this.x + this.width &&
            game.player.x + game.player.width > this.x &&
            game.player.y < this.y + this.height &&
            game.player.y + game.player.height > this.y) {
            if (!game.player.invincible) {
                game.player.takeDamage(1);
            }
        }
    }

    executePattern(pattern, data) {
        const speedMult = this.angry ? 1.5 : 1;

        switch (pattern) {
            case 'spiral':
                if (this.patternTimer % 10 === 0) {
                    const angle = this.patternTimer * data.rotationSpeed * speedMult;
                    for (let i = 0; i < data.bulletCount; i++) {
                        const a = angle + (i / data.bulletCount) * Math.PI * 2;
                        this.shootBullet(Math.cos(a), Math.sin(a), data.bulletSpeed * speedMult);
                    }
                }
                break;

            case 'cross':
                if (this.patternTimer % Math.floor(data.interval / speedMult) === 0) {
                    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                    directions.forEach(([dx, dy]) => {
                        this.shootBullet(dx, dy, data.bulletSpeed * speedMult);
                    });
                }
                break;

            case 'rain':
                if (this.patternTimer % Math.floor(data.interval / speedMult) === 0) {
                    for (let i = 0; i < data.bulletCount; i++) {
                        const x = Math.random() * game.roomWidth * CONFIG.TILE_SIZE;
                        game.projectiles.push({
                            x: x,
                            y: 20,
                            vx: 0,
                            vy: data.bulletSpeed * speedMult,
                            width: 6,
                            height: 6,
                            friendly: false,
                            damage: 1,
                            life: 300,
                            type: 'tear',
                        });
                    }
                }
                break;

            case 'chase':
                if (this.patternTimer % Math.floor(data.interval / speedMult) === 0) {
                    const dx = game.player.x - this.x;
                    const dy = game.player.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        this.shootBullet(dx / dist, dy / dist, data.bulletSpeed * speedMult);
                    }
                }
                break;
        }
    }

    shootBullet(dx, dy, speed) {
        game.projectiles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: dx * speed,
            vy: dy * speed,
            width: 6,
            height: 6,
            friendly: false,
            damage: 1,
            life: 300,
            type: 'tear',
        });
    }

    takeDamage(amount) {
        this.hp -= amount;
        triggerScreenShake(3, 5);
        playSound('bossHurt');

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.dead = true;
        game.bossActive = false;
        game.doorsLocked = false;

        // Big explosion
        for (let i = 0; i < 50; i++) {
            game.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 40 + Math.random() * 40,
                color: this.angry ? '#e94560' : '#ffffff',
                size: 3 + Math.random() * 3,
            });
        }

        triggerScreenShake(15, 60);
        playSound('bossDeath');
    }

    draw(ctx) {
        if (this.dead) return;

        const drawX = Math.floor(this.x - game.camera.x);
        const drawY = Math.floor(this.y - game.camera.y);

        // Draw boss eye as a circle
        const centerX = drawX + this.width / 2;
        const centerY = drawY + this.height / 2;
        const radius = 22;

        // Outer eye (white or red when angry)
        ctx.fillStyle = this.angry ? '#e94560' : '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Iris (red)
        ctx.fillStyle = this.angry ? '#be123c' : '#e94560';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Pupil (black)
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Health bar
        const barWidth = 100;
        const barHeight = 8;
        const barX = drawX + this.width / 2 - barWidth / 2;
        const barY = drawY - 15;

        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#e94560';
        ctx.fillRect(barX, barY, (this.hp / this.maxHp) * barWidth, barHeight);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
}

// ==================== TRAP CLASSES ====================
class FallingCeilingTrap {
    constructor(x, y, triggerX) {
        this.x = x * CONFIG.TILE_SIZE;
        this.y = y * CONFIG.TILE_SIZE;
        this.triggerX = triggerX * CONFIG.TILE_SIZE;
        this.startY = this.y;
        this.width = CONFIG.TILE_SIZE;
        this.height = CONFIG.TILE_SIZE;
        this.falling = false;
        this.fallen = false;
        this.respawnTimer = 0;
    }

    update() {
        if (this.fallen) {
            this.respawnTimer++;
            if (this.respawnTimer >= TRAP_BEHAVIORS.fallingCeiling.respawnTime) {
                this.respawnTimer = 0;
                this.fallen = false;
                this.y = this.startY;
            }
            return;
        }

        // Check trigger
        if (!this.falling && game.player.x > this.triggerX &&
            game.player.x < this.triggerX + CONFIG.TILE_SIZE * 2) {
            this.falling = true;
            playSound('trap');
        }

        // Fall
        if (this.falling) {
            this.y += TRAP_BEHAVIORS.fallingCeiling.fallSpeed;

            // Check collision with player
            if (game.player.x < this.x + this.width &&
                game.player.x + game.player.width > this.x &&
                game.player.y < this.y + this.height &&
                game.player.y + game.player.height > this.y) {
                if (!game.player.invincible) {
                    game.player.takeDamage(TRAP_BEHAVIORS.fallingCeiling.damage);
                }
            }

            // Check if hit floor
            const tileY = Math.floor((this.y + this.height) / CONFIG.TILE_SIZE);
            const tileX = Math.floor(this.x / CONFIG.TILE_SIZE);
            if (tileY < game.tiles.length && game.tiles[tileY]?.[tileX]?.solid) {
                this.fallen = true;
                this.falling = false;
                triggerScreenShake(3, 5);
            }
        }
    }

    draw(ctx) {
        if (this.fallen) return;

        const drawX = Math.floor(this.x - game.camera.x);
        const drawY = Math.floor(this.y - game.camera.y);

        // Falling brick - slightly different color to hint danger
        ctx.fillStyle = '#5c3a1a';
        ctx.fillRect(drawX, drawY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
        ctx.fillStyle = '#7a4a2b';
        ctx.fillRect(drawX + 1, drawY + 1, 6, 6);
        ctx.fillRect(drawX + 9, drawY + 1, 6, 6);
        ctx.fillRect(drawX + 5, drawY + 9, 6, 6);
    }
}

class FakeCheckpoint {
    constructor(x, y) {
        this.x = x * CONFIG.TILE_SIZE;
        this.y = y * CONFIG.TILE_SIZE;
        this.width = CONFIG.TILE_SIZE;
        this.height = CONFIG.TILE_SIZE;
        this.triggered = false;
        this.explodeTimer = 0;
    }

    update() {
        if (this.triggered) {
            this.explodeTimer++;
            if (this.explodeTimer === 30) {
                // BOOM!
                for (let i = 0; i < 30; i++) {
                    game.particles.push({
                        x: this.x + this.width / 2,
                        y: this.y + this.height / 2,
                        vx: (Math.random() - 0.5) * 8,
                        vy: (Math.random() - 0.5) * 8,
                        life: 30 + Math.random() * 30,
                        color: i % 2 === 0 ? '#e94560' : '#fbbf24',
                        size: 3,
                    });
                }
                triggerScreenShake(10, 20);
                playSound('explosion');

                // Damage player if nearby
                const dx = game.player.x - this.x;
                const dy = game.player.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < TRAP_BEHAVIORS.fakeCheckpoint.explosionRadius) {
                    game.player.takeDamage(TRAP_BEHAVIORS.fakeCheckpoint.damage);
                }
            }
            return;
        }

        // Check player touch
        if (game.player.x < this.x + this.width &&
            game.player.x + game.player.width > this.x &&
            game.player.y < this.y + this.height &&
            game.player.y + game.player.height > this.y) {
            this.triggered = true;
            playSound('checkpointFake');
        }
    }

    draw(ctx) {
        if (this.explodeTimer > 30) return;

        const drawX = Math.floor(this.x - game.camera.x);
        const drawY = Math.floor(this.y - game.camera.y);

        // Looks like a checkpoint but purple-tinted (trap!)
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(drawX + 6, drawY + 2, 2, 12);
        ctx.fillRect(drawX + 8, drawY + 2, 6, 5);

        // Flash before exploding
        if (this.triggered && this.explodeTimer % 4 < 2) {
            ctx.fillStyle = 'rgba(233, 69, 96, 0.5)';
            ctx.fillRect(drawX, drawY, this.width, this.height);
        }
    }
}

// Sawblade - rotating death that patrols a path - INSTANT KILL
class Sawblade {
    constructor(x, y, patrolLength, speed = 2, vertical = false) {
        this.startX = x * CONFIG.TILE_SIZE;
        this.startY = y * CONFIG.TILE_SIZE;
        this.x = this.startX;
        this.y = this.startY;
        this.width = 20;
        this.height = 20;
        this.patrolLength = patrolLength * CONFIG.TILE_SIZE;
        this.speed = speed;
        this.direction = 1;
        this.vertical = vertical;
        this.rotation = 0;
    }

    update() {
        // Move along patrol path
        if (this.vertical) {
            this.y += this.speed * this.direction;
            if (this.y > this.startY + this.patrolLength || this.y < this.startY) {
                this.direction *= -1;
            }
        } else {
            this.x += this.speed * this.direction;
            if (this.x > this.startX + this.patrolLength || this.x < this.startX) {
                this.direction *= -1;
            }
        }

        this.rotation += 0.3;

        // Check collision with player - INSTANT DEATH
        if (game.player && !game.player.invincible && !game.player.dashing) {
            const dx = (this.x + this.width/2) - (game.player.x + game.player.width/2);
            const dy = (this.y + this.height/2) - (game.player.y + game.player.height/2);
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 14) {
                game.player.die();
            }
        }
    }

    draw(ctx) {
        const drawX = Math.floor(this.x - game.camera.x);
        const drawY = Math.floor(this.y - game.camera.y);
        const cx = drawX + this.width/2;
        const cy = drawY + this.height/2;

        // Draw rotating sawblade
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.rotation);

        // Blade body
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Teeth
        ctx.fillStyle = '#e94560';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 6, Math.sin(angle) * 6);
            ctx.lineTo(Math.cos(angle + 0.2) * 12, Math.sin(angle + 0.2) * 12);
            ctx.lineTo(Math.cos(angle - 0.2) * 12, Math.sin(angle - 0.2) * 12);
            ctx.fill();
        }

        // Center
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Laser beam - sweeps or pulses - INSTANT KILL
class LaserBeam {
    constructor(x, y, length, direction = 'right', sweepSpeed = 0, onTime = 60, offTime = 60) {
        this.x = x * CONFIG.TILE_SIZE;
        this.y = y * CONFIG.TILE_SIZE;
        this.length = length * CONFIG.TILE_SIZE;
        this.direction = direction; // 'right', 'down', 'left', 'up'
        this.sweepSpeed = sweepSpeed;
        this.sweepAngle = 0;
        this.onTime = onTime;
        this.offTime = offTime;
        this.timer = 0;
        this.active = true;
        this.warning = false;
    }

    update() {
        this.timer++;

        // Cycle on/off
        const cycleTime = this.onTime + this.offTime;
        const cyclePos = this.timer % cycleTime;

        if (cyclePos < this.onTime) {
            this.active = true;
            this.warning = false;
        } else if (cyclePos < this.onTime + 20) {
            // Warning before turning off
            this.warning = true;
            this.active = true;
        } else {
            this.active = false;
            this.warning = cyclePos > cycleTime - 20; // Warning before turning on
        }

        // Sweep if enabled
        if (this.sweepSpeed > 0) {
            this.sweepAngle += this.sweepSpeed;
        }

        // Check collision if active
        if (this.active && game.player && !game.player.invincible && !game.player.dashing) {
            if (this.checkLaserCollision()) {
                game.player.die();
            }
        }
    }

    checkLaserCollision() {
        const px = game.player.x + game.player.width / 2;
        const py = game.player.y + game.player.height / 2;
        const beamWidth = 4;

        switch (this.direction) {
            case 'right':
                return py > this.y - beamWidth && py < this.y + beamWidth &&
                       px > this.x && px < this.x + this.length;
            case 'left':
                return py > this.y - beamWidth && py < this.y + beamWidth &&
                       px < this.x && px > this.x - this.length;
            case 'down':
                return px > this.x - beamWidth && px < this.x + beamWidth &&
                       py > this.y && py < this.y + this.length;
            case 'up':
                return px > this.x - beamWidth && px < this.x + beamWidth &&
                       py < this.y && py > this.y - this.length;
        }
        return false;
    }

    draw(ctx) {
        const drawX = Math.floor(this.x - game.camera.x);
        const drawY = Math.floor(this.y - game.camera.y);

        // Draw emitter
        ctx.fillStyle = this.active ? '#e94560' : '#4a4a6a';
        ctx.fillRect(drawX - 4, drawY - 4, 8, 8);

        if (!this.active && !this.warning) return;

        // Draw beam
        const alpha = this.warning ? 0.3 + Math.sin(this.timer * 0.5) * 0.3 : 0.8;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#e94560';

        switch (this.direction) {
            case 'right':
                ctx.fillRect(drawX, drawY - 2, this.length, 4);
                // Glow
                ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
                ctx.fillRect(drawX, drawY - 6, this.length, 12);
                break;
            case 'left':
                ctx.fillRect(drawX - this.length, drawY - 2, this.length, 4);
                ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
                ctx.fillRect(drawX - this.length, drawY - 6, this.length, 12);
                break;
            case 'down':
                ctx.fillRect(drawX - 2, drawY, 4, this.length);
                ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
                ctx.fillRect(drawX - 6, drawY, 12, this.length);
                break;
            case 'up':
                ctx.fillRect(drawX - 2, drawY - this.length, 4, this.length);
                ctx.fillStyle = 'rgba(233, 69, 96, 0.3)';
                ctx.fillRect(drawX - 6, drawY - this.length, 12, this.length);
                break;
        }
        ctx.globalAlpha = 1;
    }
}

// Crusher - ceiling/wall that slams down - INSTANT KILL
class Crusher {
    constructor(x, y, width = 2, height = 3, direction = 'down', triggerDistance = 48) {
        this.startX = x * CONFIG.TILE_SIZE;
        this.startY = y * CONFIG.TILE_SIZE;
        this.x = this.startX;
        this.y = this.startY;
        this.width = width * CONFIG.TILE_SIZE;
        this.height = height * CONFIG.TILE_SIZE;
        this.direction = direction;
        this.triggerDistance = triggerDistance;
        this.state = 'waiting'; // waiting, crushing, returning
        this.crushSpeed = 12;
        this.returnSpeed = 1;
        this.maxTravel = 80;
        this.travelDistance = 0;
        this.waitTimer = 0;
    }

    update() {
        const px = game.player.x + game.player.width / 2;
        const py = game.player.y + game.player.height / 2;

        switch (this.state) {
            case 'waiting':
                // Check if player is in trigger zone
                let inZone = false;
                if (this.direction === 'down') {
                    inZone = px > this.x && px < this.x + this.width &&
                             py > this.y + this.height && py < this.y + this.height + this.triggerDistance;
                } else if (this.direction === 'up') {
                    inZone = px > this.x && px < this.x + this.width &&
                             py < this.y && py > this.y - this.triggerDistance;
                } else if (this.direction === 'right') {
                    inZone = py > this.y && py < this.y + this.height &&
                             px > this.x + this.width && px < this.x + this.width + this.triggerDistance;
                } else if (this.direction === 'left') {
                    inZone = py > this.y && py < this.y + this.height &&
                             px < this.x && px > this.x - this.triggerDistance;
                }

                if (inZone) {
                    this.state = 'crushing';
                    playSound('trap');
                }
                break;

            case 'crushing':
                // Move fast toward player
                if (this.direction === 'down') this.y += this.crushSpeed;
                else if (this.direction === 'up') this.y -= this.crushSpeed;
                else if (this.direction === 'right') this.x += this.crushSpeed;
                else if (this.direction === 'left') this.x -= this.crushSpeed;

                this.travelDistance += this.crushSpeed;

                // Check collision with player - INSTANT DEATH
                if (game.player && !game.player.invincible) {
                    if (game.player.x < this.x + this.width &&
                        game.player.x + game.player.width > this.x &&
                        game.player.y < this.y + this.height &&
                        game.player.y + game.player.height > this.y) {
                        game.player.die();
                    }
                }

                // Stop when max travel reached
                if (this.travelDistance >= this.maxTravel) {
                    this.state = 'returning';
                    this.waitTimer = 30;
                    triggerScreenShake(5, 10);
                }
                break;

            case 'returning':
                if (this.waitTimer > 0) {
                    this.waitTimer--;
                    return;
                }

                // Return slowly
                if (this.direction === 'down') this.y -= this.returnSpeed;
                else if (this.direction === 'up') this.y += this.returnSpeed;
                else if (this.direction === 'right') this.x -= this.returnSpeed;
                else if (this.direction === 'left') this.x += this.returnSpeed;

                this.travelDistance -= this.returnSpeed;

                if (this.travelDistance <= 0) {
                    this.state = 'waiting';
                    this.x = this.startX;
                    this.y = this.startY;
                    this.travelDistance = 0;
                }
                break;
        }
    }

    draw(ctx) {
        const drawX = Math.floor(this.x - game.camera.x);
        const drawY = Math.floor(this.y - game.camera.y);

        // Main body
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(drawX, drawY, this.width, this.height);

        // Danger stripes
        ctx.fillStyle = '#fbbf24';
        const stripeSize = 6;
        for (let i = 0; i < this.width / stripeSize; i++) {
            if (i % 2 === 0) {
                if (this.direction === 'down') {
                    ctx.fillRect(drawX + i * stripeSize, drawY + this.height - stripeSize, stripeSize, stripeSize);
                } else if (this.direction === 'up') {
                    ctx.fillRect(drawX + i * stripeSize, drawY, stripeSize, stripeSize);
                }
            }
        }

        // Spikes on crushing edge
        ctx.fillStyle = '#e94560';
        const spikeCount = Math.floor(this.width / 8);
        for (let i = 0; i < spikeCount; i++) {
            const sx = drawX + (i + 0.5) * (this.width / spikeCount);
            ctx.beginPath();
            if (this.direction === 'down') {
                ctx.moveTo(sx - 4, drawY + this.height);
                ctx.lineTo(sx, drawY + this.height + 6);
                ctx.lineTo(sx + 4, drawY + this.height);
            } else if (this.direction === 'up') {
                ctx.moveTo(sx - 4, drawY);
                ctx.lineTo(sx, drawY - 6);
                ctx.lineTo(sx + 4, drawY);
            }
            ctx.fill();
        }
    }
}

// Fake Exit - looks like the real exit but KILLS YOU
class FakeExit {
    constructor(x, y) {
        this.x = x * CONFIG.TILE_SIZE;
        this.y = y * CONFIG.TILE_SIZE;
        this.width = CONFIG.TILE_SIZE;
        this.height = CONFIG.TILE_SIZE;
        this.triggered = false;
        this.deathTimer = 0;
    }

    update() {
        if (this.triggered) {
            this.deathTimer++;
            if (this.deathTimer === 30) {
                // Show fake "LEVEL COMPLETE" then kill
                game.fakeVictoryActive = true;
            }
            if (this.deathTimer === 90) {
                // GOTCHA!
                game.fakeVictoryActive = false;
                hideOverlay('levelCompleteScreen');
                game.player.die();
                triggerScreenShake(10, 20);
            }
            return;
        }

        // Check player touch
        if (game.player &&
            game.player.x < this.x + this.width &&
            game.player.x + game.player.width > this.x &&
            game.player.y < this.y + this.height &&
            game.player.y + game.player.height > this.y) {
            this.triggered = true;
            playSound('checkpoint'); // Fake victory sound
            // Show fake level complete
            showOverlay('levelCompleteScreen');
        }
    }

    draw(ctx) {
        if (this.deathTimer > 90) return;

        const drawX = Math.floor(this.x - game.camera.x);
        const drawY = Math.floor(this.y - game.camera.y);

        // Looks EXACTLY like a real exit
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(drawX + 2, drawY, 12, 16);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(drawX + 4, drawY + 2, 8, 12);
        // Glow
        ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
        ctx.fillRect(drawX - 4, drawY - 4, 24, 24);
    }
}

// ==================== INPUT HANDLING ====================
const input = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpPressed: false,
    shoot: false,
    dash: false,
    dashPressed: false,
    pause: false,
    pausePressed: false,
};

function setupInput() {
    const keyMap = {
        'ArrowLeft': 'left', 'KeyA': 'left',
        'ArrowRight': 'right', 'KeyD': 'right',
        'ArrowUp': 'up', 'KeyW': 'up',
        'ArrowDown': 'down', 'KeyS': 'down',
        'Space': 'jump', 'KeyZ': 'jump',
        'ShiftLeft': 'shoot', 'ShiftRight': 'shoot', 'KeyX': 'shoot',
        'KeyC': 'dash',
        'KeyP': 'pause', 'Escape': 'pause',
    };

    document.addEventListener('keydown', (e) => {
        const action = keyMap[e.code];
        if (action) {
            e.preventDefault();
            if (action === 'jump' && !input.jump) input.jumpPressed = true;
            if (action === 'dash' && !input.dash) input.dashPressed = true;
            if (action === 'pause' && !input.pause) input.pausePressed = true;
            input[action] = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        const action = keyMap[e.code];
        if (action) {
            e.preventDefault();
            input[action] = false;
        }
    });
}

function resetInputPressed() {
    input.jumpPressed = false;
    input.dashPressed = false;
    input.pausePressed = false;
}

// ==================== AUDIO ====================
function initAudio() {
    game.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type) {
    if (!game.audioCtx) return;

    const ctx = game.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
        case 'jump':
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;

        case 'shoot':
            osc.type = 'square';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;

        case 'hurt':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
            break;

        case 'death':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
            break;

        case 'dash':
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;

        case 'enemyShoot':
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            osc.start(now);
            osc.stop(now + 0.08);
            break;

        case 'enemyDeath':
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;

        case 'trap':
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;

        case 'explosion':
            // Noise burst
            const bufferSize = ctx.sampleRate * 0.3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseGain = ctx.createGain();
            noise.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noiseGain.gain.setValueAtTime(0.3, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            noise.start(now);
            noise.stop(now + 0.3);
            return;

        case 'checkpoint':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523, now);
            osc.frequency.setValueAtTime(659, now + 0.1);
            osc.frequency.setValueAtTime(784, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.setValueAtTime(0.1, now + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
            break;

        case 'checkpointFake':
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523, now);
            osc.frequency.setValueAtTime(400, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
            break;

        case 'bossHurt':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            break;

        case 'bossDeath':
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(20, now + 1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.start(now);
            osc.stop(now + 1);
            break;
    }
}

// ==================== SCREEN EFFECTS ====================
function triggerScreenShake(intensity, duration) {
    game.screenShake = { active: true, intensity, duration };
}

function triggerScreenFlash(color, duration) {
    game.screenFlash = { active: true, color, duration };
}

function updateScreenEffects() {
    if (game.screenShake.active) {
        game.screenShake.duration--;
        if (game.screenShake.duration <= 0) {
            game.screenShake.active = false;
        }
    }

    if (game.screenFlash.active) {
        game.screenFlash.duration--;
        if (game.screenFlash.duration <= 0) {
            game.screenFlash.active = false;
        }
    }
}

// ==================== UI FUNCTIONS ====================
function updateHealthDisplay() {
    const hearts = document.querySelectorAll('#health .heart');
    hearts.forEach((heart, i) => {
        if (i < game.player.hp) {
            heart.classList.add('active');
        } else {
            heart.classList.remove('active');
        }
    });
}

function updateDeathDisplay() {
    document.getElementById('deaths').textContent = game.deaths;
    document.getElementById('totalDeaths').textContent = game.totalDeaths;
}

function updateLevelDisplay() {
    document.getElementById('currentLevel').textContent = game.currentLevel + 1;
    document.getElementById('currentRoom').textContent = game.currentRoom + 1;
}

function showOverlay(id) {
    document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
}

function hideOverlay(id) {
    document.getElementById(id)?.classList.remove('active');
}

function hideAllOverlays() {
    document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
}

function showDeathScreen() {
    const deathScreen = document.getElementById('deathScreen');
    const deathMessage = deathScreen.querySelector('.death-message');
    deathMessage.textContent = getDeathMessage();
    showOverlay('deathScreen');
}

function hideDeathScreen() {
    hideOverlay('deathScreen');
}

function showBossWarning(name) {
    const bossWarning = document.getElementById('bossWarning');
    bossWarning.querySelector('.boss-name').textContent = name;
    showOverlay('bossWarning');

    setTimeout(() => {
        hideOverlay('bossWarning');
    }, 2000);
}

// ==================== LEVEL MANAGEMENT ====================
function loadRoom(levelIndex, roomIndex) {
    const level = LEVELS[levelIndex];
    if (!level || !level.rooms[roomIndex]) {
        // Game complete!
        showVictoryScreen();
        return;
    }

    const room = level.rooms[roomIndex];

    // Parse layout
    game.tiles = parseLevel(room.layout);
    game.roomWidth = room.width;
    game.roomHeight = room.height;

    // Create player
    const startX = room.playerStart.x * CONFIG.TILE_SIZE;
    const startY = room.playerStart.y * CONFIG.TILE_SIZE;
    game.player = new Player(startX, startY);

    // Clear entities
    game.enemies = [];
    game.projectiles = [];
    game.particles = [];
    game.traps = [];
    game.items = [];
    game.boss = null;
    game.bossActive = false;
    game.doorsLocked = false;

    // Spawn enemies
    if (room.enemies) {
        room.enemies.forEach(e => {
            game.enemies.push(new Enemy(e.x * CONFIG.TILE_SIZE, e.y * CONFIG.TILE_SIZE, e.type));
        });
    }

    // Spawn traps
    if (room.traps) {
        room.traps.forEach(t => {
            switch (t.type) {
                case 'fallingCeiling':
                    game.traps.push(new FallingCeilingTrap(t.x, t.y, t.triggerX));
                    break;
                case 'fakeCheckpoint':
                    game.traps.push(new FakeCheckpoint(t.x, t.y));
                    break;
                case 'sawblade':
                    game.traps.push(new Sawblade(t.x, t.y, t.patrolLength || 3, t.speed || 2, t.vertical || false));
                    break;
                case 'laser':
                    game.traps.push(new LaserBeam(t.x, t.y, t.length || 5, t.direction || 'right', t.sweepSpeed || 0, t.onTime || 60, t.offTime || 60));
                    break;
                case 'crusher':
                    game.traps.push(new Crusher(t.x, t.y, t.width || 2, t.height || 3, t.direction || 'down', t.triggerDistance || 48));
                    break;
                case 'fakeExit':
                    game.traps.push(new FakeExit(t.x, t.y));
                    break;
            }
        });
    }

    // Setup checkpoints in tiles
    if (room.checkpoints) {
        room.checkpoints.forEach(c => {
            if (game.tiles[c.y] && game.tiles[c.y][c.x]) {
                game.tiles[c.y][c.x].checkpoint = c.real;
                game.tiles[c.y][c.x].fakeCheckpoint = !c.real;
            }
        });
    }

    // Setup boss
    if (room.boss) {
        // Boss will be triggered when player crosses trigger zone
        game.pendingBoss = room.boss;
    }

    // Update UI
    updateLevelDisplay();
    updateHealthDisplay();
    game.levelDeaths = 0;
    game.levelStartTime = Date.now();

    // Reset effects
    game.gravityFlipped = false;
    game.controlsMirrored = false;
    game.speedMultiplier = 1;
    game.lightsOut = false;
}

function completeRoom() {
    const level = LEVELS[game.currentLevel];
    game.currentRoom++;

    if (game.currentRoom >= level.rooms.length) {
        // Level complete - show stats then go to next level
        showLevelComplete();
    } else {
        // Next room
        loadRoom(game.currentLevel, game.currentRoom);
    }
}

function showLevelComplete() {
    const elapsed = Math.floor((Date.now() - game.levelStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    document.getElementById('levelTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('levelDeaths').textContent = game.levelDeaths;

    showOverlay('levelCompleteScreen');

    // Wait for keypress to continue
    const continueHandler = (e) => {
        document.removeEventListener('keydown', continueHandler);
        hideOverlay('levelCompleteScreen');

        // FAKE OUT - occasionally the level complete is a trap!
        if (Math.random() < 0.2 && game.currentLevel > 0) {
            // Fake victory!
            setTimeout(() => {
                game.player.takeDamage(3); // Instant death
            }, 500);
        } else {
            // Real victory
            game.currentLevel++;
            game.currentRoom = 0;
            loadRoom(game.currentLevel, game.currentRoom);
        }
    };

    setTimeout(() => {
        document.addEventListener('keydown', continueHandler);
    }, 1000);
}

function showVictoryScreen() {
    const elapsed = Math.floor((Date.now() - game.totalTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    document.getElementById('finalDeaths').textContent = game.deaths;
    document.getElementById('finalTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    showOverlay('victoryScreen');
    showBackButton(); // Show on victory
    game.running = false;
}

function triggerBoss() {
    if (!game.pendingBoss) return;

    game.boss = new Boss(game.pendingBoss);
    game.bossActive = true;
    game.doorsLocked = true;
    showBossWarning(game.pendingBoss.name);
    game.pendingBoss = null;
}

// ==================== GAME LOOP ====================
function update() {
    if (!game.running || game.paused) return;

    game.frameCount++;

    // Handle pause
    if (input.pausePressed) {
        togglePause();
    }

    // Update player
    game.player.update(input);

    // Update enemies
    game.enemies.forEach(e => e.update());
    game.enemies = game.enemies.filter(e => !e.dead);

    // Update boss
    if (game.boss) {
        game.boss.update();
    }

    // Update projectiles
    game.projectiles.forEach(p => {
        p.x += p.vx * game.speedMultiplier;
        p.y += p.vy * game.speedMultiplier;
        p.life--;

        // Check collision with walls
        const tileX = Math.floor(p.x / CONFIG.TILE_SIZE);
        const tileY = Math.floor(p.y / CONFIG.TILE_SIZE);
        if (tileY >= 0 && tileY < game.tiles.length &&
            tileX >= 0 && tileX < game.tiles[0].length) {
            if (game.tiles[tileY][tileX].solid) {
                p.dead = true;
            }
        }

        // Player bullets hitting enemies
        if (p.friendly && !p.dead) {
            game.enemies.forEach(e => {
                if (!e.dead &&
                    p.x < e.x + e.width &&
                    p.x + p.width > e.x &&
                    p.y < e.y + e.height &&
                    p.y + p.height > e.y) {
                    e.takeDamage(p.damage);
                    p.dead = true;
                }
            });
        }

        // Enemy bullets hitting player
        if (!p.friendly && !p.dead) {
            if (p.x < game.player.x + game.player.width &&
                p.x + p.width > game.player.x &&
                p.y < game.player.y + game.player.height &&
                p.y + p.height > game.player.y) {
                if (!game.player.invincible && !game.player.dashing) {
                    game.player.takeDamage(p.damage);
                    p.dead = true;
                }
            }
        }

        if (p.life <= 0) p.dead = true;
    });
    game.projectiles = game.projectiles.filter(p => !p.dead);

    // Update traps
    game.traps.forEach(t => t.update());

    // Update particles
    game.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity on particles
        p.life--;
    });
    game.particles = game.particles.filter(p => p.life > 0);

    // Update camera
    updateCamera();

    // Update screen effects
    updateScreenEffects();

    // Reset pressed flags
    resetInputPressed();
}

function updateCamera() {
    // Center on player
    let targetX = game.player.x - CONFIG.NATIVE_WIDTH / 2 + game.player.width / 2;
    let targetY = game.player.y - CONFIG.NATIVE_HEIGHT / 2 + game.player.height / 2;

    // Clamp to level bounds
    const maxX = game.roomWidth * CONFIG.TILE_SIZE - CONFIG.NATIVE_WIDTH;
    const maxY = game.roomHeight * CONFIG.TILE_SIZE - CONFIG.NATIVE_HEIGHT;

    targetX = Math.max(0, Math.min(targetX, maxX));
    targetY = Math.max(0, Math.min(targetY, maxY));

    // Smooth follow
    game.camera.x += (targetX - game.camera.x) * 0.1;
    game.camera.y += (targetY - game.camera.y) * 0.1;

    // Apply screen shake
    if (game.screenShake.active) {
        game.camera.x += (Math.random() - 0.5) * game.screenShake.intensity * 2;
        game.camera.y += (Math.random() - 0.5) * game.screenShake.intensity * 2;
    }
}

function render() {
    const ctx = game.ctx;

    // Clear
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, CONFIG.NATIVE_WIDTH, CONFIG.NATIVE_HEIGHT);

    // Don't render game elements if not running
    if (!game.running || !game.player) {
        return;
    }

    // Draw background pattern
    ctx.fillStyle = '#1a1a2e';
    for (let x = 0; x < CONFIG.NATIVE_WIDTH; x += 32) {
        for (let y = 0; y < CONFIG.NATIVE_HEIGHT; y += 32) {
            if ((x + y) % 64 === 0) {
                ctx.fillRect(x, y, 32, 32);
            }
        }
    }

    // Draw tiles with simple colored rectangles
    for (let y = 0; y < game.tiles.length; y++) {
        for (let x = 0; x < game.tiles[y].length; x++) {
            const tile = game.tiles[y][x];
            const drawX = Math.floor(x * CONFIG.TILE_SIZE - game.camera.x);
            const drawY = Math.floor(y * CONFIG.TILE_SIZE - game.camera.y);

            // Skip if off screen
            if (drawX < -CONFIG.TILE_SIZE || drawX > CONFIG.NATIVE_WIDTH ||
                drawY < -CONFIG.TILE_SIZE || drawY > CONFIG.NATIVE_HEIGHT) continue;

            if (tile.solid) {
                // Brick wall - brown with pattern
                ctx.fillStyle = '#5c3a1a';
                ctx.fillRect(drawX, drawY, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE);
                ctx.fillStyle = '#8b5a2b';
                ctx.fillRect(drawX + 1, drawY + 1, 6, 6);
                ctx.fillRect(drawX + 9, drawY + 1, 6, 6);
                ctx.fillRect(drawX + 5, drawY + 9, 6, 6);
            } else if (tile.platform) {
                // Platform - gray
                ctx.fillStyle = tile.crumble ? '#4a4a4a' : '#6a6a8a';
                ctx.fillRect(drawX, drawY, CONFIG.TILE_SIZE, 4);
            } else if (tile.spike) {
                // Spike - red triangles
                ctx.fillStyle = '#e94560';
                ctx.beginPath();
                ctx.moveTo(drawX + 8, drawY + 2);
                ctx.lineTo(drawX + 14, drawY + 14);
                ctx.lineTo(drawX + 2, drawY + 14);
                ctx.fill();
            } else if (tile.checkpoint) {
                // Checkpoint - cyan flag
                ctx.fillStyle = tile.activated ? '#00d4ff' : '#0891b2';
                ctx.fillRect(drawX + 6, drawY + 2, 2, 12);
                ctx.fillRect(drawX + 8, drawY + 2, 6, 5);
                if (tile.activated) {
                    ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
                    ctx.fillRect(drawX - 2, drawY - 2, 20, 20);
                }
            } else if (tile.exit) {
                // Exit - glowing green door
                ctx.fillStyle = '#4ade80';
                ctx.fillRect(drawX + 2, drawY, 12, 16);
                ctx.fillStyle = '#22c55e';
                ctx.fillRect(drawX + 4, drawY + 2, 8, 12);
                // Glow
                ctx.fillStyle = 'rgba(74, 222, 128, 0.4)';
                ctx.fillRect(drawX - 4, drawY - 4, 24, 24);
            }
        }
    }

    // Draw traps
    game.traps.forEach(t => t.draw(ctx));

    // Draw enemies
    game.enemies.forEach(e => e.draw(ctx));

    // Draw boss
    if (game.boss) {
        game.boss.draw(ctx);
    }

    // Draw projectiles
    game.projectiles.forEach(p => {
        const drawX = Math.floor(p.x - game.camera.x);
        const drawY = Math.floor(p.y - game.camera.y);
        ctx.fillStyle = p.friendly ? '#fbbf24' : '#e94560';
        ctx.fillRect(drawX, drawY, p.width, p.height);
    });

    // Draw player as a simple sprite
    if (game.player) {
        const px = Math.floor(game.player.x - game.camera.x);
        const py = Math.floor(game.player.y - game.camera.y);

        // Flicker when invincible
        if (game.player.invincible && !game.player.dashing && Math.floor(game.frameCount / 3) % 2 === 0) {
            // Skip drawing - flickering
        } else {
            // Body
            ctx.fillStyle = '#4ade80';
            ctx.fillRect(px + 2, py + 4, 8, 8);
            // Head
            ctx.fillStyle = '#86efac';
            ctx.fillRect(px + 3, py, 6, 5);
            // Eyes
            ctx.fillStyle = '#000';
            if (game.player.facingRight) {
                ctx.fillRect(px + 6, py + 2, 2, 2);
            } else {
                ctx.fillRect(px + 4, py + 2, 2, 2);
            }
            // Legs
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(px + 2, py + 12, 3, 4);
            ctx.fillRect(px + 7, py + 12, 3, 4);
        }
    }

    // Draw particles
    game.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / 60);
        ctx.fillRect(Math.floor(p.x - game.camera.x), Math.floor(p.y - game.camera.y), p.size, p.size);
    });
    ctx.globalAlpha = 1;

    // Screen flash
    if (game.screenFlash.active) {
        ctx.fillStyle = game.screenFlash.color;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, 0, CONFIG.NATIVE_WIDTH, CONFIG.NATIVE_HEIGHT);
        ctx.globalAlpha = 1;
    }

    // Lights out effect
    if (game.lightsOut && game.player) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CONFIG.NATIVE_WIDTH, CONFIG.NATIVE_HEIGHT);
        // Only show area around player
        const gradient = ctx.createRadialGradient(
            game.player.x - game.camera.x + game.player.width / 2,
            game.player.y - game.camera.y + game.player.height / 2,
            10,
            game.player.x - game.camera.x + game.player.width / 2,
            game.player.y - game.camera.y + game.player.height / 2,
            50
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, CONFIG.NATIVE_WIDTH, CONFIG.NATIVE_HEIGHT);
    }
}

function gameLoop(timestamp) {
    game.deltaTime = timestamp - game.lastTime;
    game.lastTime = timestamp;

    update();
    render();

    requestAnimationFrame(gameLoop);
}

// ==================== PAUSE HANDLING ====================
function togglePause() {
    game.paused = !game.paused;
    if (game.paused) {
        showOverlay('pauseMenu');
        showBackButton(); // Show when paused
    } else {
        hideOverlay('pauseMenu');
        hideBackButton(); // Hide when resuming
    }
}

// ==================== INITIALIZATION ====================
function init() {
    // Setup canvas
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');

    // Set native resolution
    game.canvas.width = CONFIG.NATIVE_WIDTH;
    game.canvas.height = CONFIG.NATIVE_HEIGHT;

    // Scale to fit window
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize systems
    game.spriteRenderer = new SpriteRenderer(game.ctx);
    setupInput();
    initAudio();

    // Setup UI buttons
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('controlsBtn').addEventListener('click', () => showOverlay('controlsScreen'));
    document.getElementById('backToTitleBtn').addEventListener('click', () => showOverlay('titleScreen'));
    document.getElementById('resumeBtn').addEventListener('click', togglePause);
    document.getElementById('restartLevelBtn').addEventListener('click', () => {
        hideOverlay('pauseMenu');
        game.paused = false;
        loadRoom(game.currentLevel, game.currentRoom);
    });
    document.getElementById('quitBtn').addEventListener('click', () => {
        game.running = false;
        game.paused = false;
        hideOverlay('pauseMenu');
        showOverlay('titleScreen');
        showBackButton(); // Show when returning to title
    });
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        hideOverlay('victoryScreen');
        game.deaths = 0;
        game.currentLevel = 0;
        game.currentRoom = 0;
        startGame();
    });

    // Update total deaths display
    document.getElementById('totalDeaths').textContent = game.totalDeaths;

    // Show title screen
    showOverlay('titleScreen');

    // Start game loop (but not playing yet)
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scale to fit while maintaining aspect ratio
    const scaleX = containerWidth / CONFIG.NATIVE_WIDTH;
    const scaleY = containerHeight / CONFIG.NATIVE_HEIGHT;
    const scale = Math.floor(Math.min(scaleX, scaleY));

    game.canvas.style.width = `${CONFIG.NATIVE_WIDTH * scale}px`;
    game.canvas.style.height = `${CONFIG.NATIVE_HEIGHT * scale}px`;
}

function startGame() {
    // Resume audio context (browser requirement)
    if (game.audioCtx && game.audioCtx.state === 'suspended') {
        game.audioCtx.resume();
    }

    hideAllOverlays();
    hideBackButton(); // Hide during gameplay

    game.running = true;
    game.paused = false;
    game.deaths = 0;
    game.currentLevel = 0;
    game.currentRoom = 0;
    game.totalTime = Date.now();

    loadRoom(0, 0);
    updateDeathDisplay();
}

// Hide/show back to vault button
function hideBackButton() {
    const btn = document.querySelector('.back-to-vault');
    if (btn) btn.style.display = 'none';
}

function showBackButton() {
    const btn = document.querySelector('.back-to-vault');
    if (btn) btn.style.display = 'flex';
}

// Start when page loads
window.addEventListener('load', init);
