import { Boid } from "./Boid.js";
import { Block } from "./Block.js";
import SoundManager from "./SoundManager.js";
import { handleGenes, drawBoids } from "./Utils.js";

export class BoidManager {
    constructor(settings) {
        this.settings = settings;
        const canvas = document.getElementById('canvas');
        this.width = canvas.width;
        this.height = canvas.height;
        this.boidDictionary = {};
        this.blockDictionary = {};
        this.createAdam();
        this.createStartingBlocks();

        this.soundManager = new SoundManager(this.settings);
        this.soundManager.loadSound('milestone', '/milestone.mp3');
        this.soundManager.loadSound('birth', '/birth.mp3')
    }

    updateSettings(newSettings) {
        const oldSectorSize = this.settings ? this.settings.SECTOR_SIZE : null;
        this.settings = { ...newSettings };
        // Update DENSITY_DISTANCE_SQUARED when DENSITY_DISTANCE changes
        this.settings.DENSITY_DISTANCE_SQUARED = newSettings.DENSITY_DISTANCE * newSettings.DENSITY_DISTANCE;

        // If sector size changed, recalculate all boid sectors.
        if (oldSectorSize && oldSectorSize !== newSettings.SECTOR_SIZE) {
            this.recalculateAllBoidSectors();
            this.blockDictionary = {};
        }
    }

    recalculateAllBoidSectors() {
        let newDictionary = {};
        Object.values(this.boidDictionary).forEach(sectorBoids => {
            sectorBoids.forEach(boid => {
                let newSectorX = Math.floor(boid.x / this.settings.SECTOR_SIZE);
                let newSectorY = Math.floor(boid.y / this.settings.SECTOR_SIZE);
                let newSector = `${newSectorX},${newSectorY}`;
                boid.sector = newSector;
                if (newDictionary[newSector]) {
                    newDictionary[newSector].push(boid);
                } else {
                    newDictionary[newSector] = [boid];
                }
            });
        });
        this.boidDictionary = newDictionary;
    }

    addBlock(x, y, settings) {
        // Snap to sector grid
        const sectorX = Math.floor(x / settings.SECTOR_SIZE);
        const sectorY = Math.floor(y / settings.SECTOR_SIZE);
        const snapX = sectorX * settings.SECTOR_SIZE;
        const snapY = sectorY * settings.SECTOR_SIZE;
        const sectorKey = `${sectorX},${sectorY}`;

        if (this.blockDictionary[sectorKey] && this.blockDictionary[sectorKey].length > 0) {
            return;
        }

        const newBlock = new Block(snapX, snapY, settings);

        if (this.blockDictionary[sectorKey]) {
            this.blockDictionary[sectorKey].push(newBlock);
        } else {
            this.blockDictionary[sectorKey] = [newBlock];
        }
    }

    run(ctx) {
        this.drawGrid(ctx);
        this.drawBlocks(ctx);
        // this.soundManager.checkMilestone(this.currentBoids);

        let boidsToRemove = [];
        let parentsToReproduce = [];

        if (this.currentBoids <= 0) {
            this.createAdam();
        }

        Object.values(this.boidDictionary).forEach(sectorBoids => {
            [...sectorBoids].forEach(boid => {
                let nearbyBoids = this.getNearByBoids(boid);
                let nearbyBlocks = this.getNearByBlocks(boid);

                drawBoids(boid, ctx);

                let oldSector = boid.sector;
                boid.update(this.settings, this.blockDictionary);
                boid.handleFlocking(nearbyBoids, nearbyBlocks, this.settings);

                if (boid.sector !== oldSector) {
                    this.moveBoidToNewSector(boid, oldSector);
                }

                if (boid.age >= boid.lifespan) {
                    boidsToRemove.push(boid);
                    parentsToReproduce.push(boid);
                }
            });
        });

        if (parentsToReproduce.length > 0) {
            for (let parent of parentsToReproduce) {
                this.addBoids(parent, this.settings.BIRTHRATE);
            }
        }

        if (boidsToRemove.length > 0) {
            this.removeBoids(boidsToRemove, ctx);
        }
    }

    drawBlocks(ctx) {
        Object.values(this.blockDictionary).forEach(sectorBlocks => {
            sectorBlocks.forEach(block => {
                ctx.fillStyle = '#8B4513'; 
                ctx.fillRect(block.x, block.y, this.settings.SECTOR_SIZE, this.settings.SECTOR_SIZE);

                
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                ctx.strokeRect(block.x, block.y, this.settings.SECTOR_SIZE, this.settings.SECTOR_SIZE);

                ctx.fillStyle = '#A0522D';
                const brickHeight = this.settings.SECTOR_SIZE / 4;
                for (let i = 0; i < 4; i++) {
                    if (i % 2 === 0) {
                        ctx.fillRect(block.x + this.settings.SECTOR_SIZE / 4, block.y + i * brickHeight, this.settings.SECTOR_SIZE / 2, 1);
                    } else {
                        ctx.fillRect(block.x + this.settings.SECTOR_SIZE / 8, block.y + i * brickHeight, this.settings.SECTOR_SIZE / 4, 1);
                        ctx.fillRect(block.x + this.settings.SECTOR_SIZE * 5 / 8, block.y + i * brickHeight, this.settings.SECTOR_SIZE / 4, 1);
                    }
                }
            });
        });
    }

    addBoids(parentBoid, number) {
        let populationPressure = this.currentBoids / this.settings.MAX_BOIDS;
        let reproductionChance = Math.max(0.1, 1 - populationPressure);

        // Reproduction is not hard capped by the limit, rather the more boids over the limit there are, the less likely they are to reproduce.
        if (Math.random() > reproductionChance) {
            return;
        }

        // If the boid is hugging the edge of the screen or is off screen, they should not reproduce.
        if (parentBoid.x <= 0 || parentBoid.x >= this.width) {
            return;
        }

        if (parentBoid.y <= 0 || parentBoid.y >= this.width) {
            return;
        }

        // If through genetic drift, the parent has a lifespan beneath the min, they do not reproduce.
        if (parentBoid.lifespan <= this.settings.MIN_LIFESPAN) {
            return;
        }

        
        // Boids who are not in a flock dont reproduce. This is to avoid visual noise.
        if (parentBoid.alone === true && parentBoid.amIadam === false) {
            return;
        }

        for (let i = 0; i < number; i++) {
            // this.soundManager.playBirthSound(0.05);

            this.currentBoids += 1;
            let newDx = parentBoid.dx + Math.random() * 0.2 - 0.1;
            let newDy = parentBoid.dy + Math.random() * 0.2 - 0.1;

            let sectorX = Math.floor(parentBoid.x / this.settings.SECTOR_SIZE);
            let sectorY = Math.floor(parentBoid.y / this.settings.SECTOR_SIZE);
            let sector = `${sectorX},${sectorY}`;

            let newBoid = new Boid(parentBoid.x, parentBoid.y, newDx, newDy,
                parentBoid.gene, this.settings.LIFESPAN, sector, false)

            handleGenes(newBoid, parentBoid, this.settings)

            if (newBoid.sector in this.boidDictionary) {
                this.boidDictionary[newBoid.sector].push(newBoid);
            } else {
                this.boidDictionary[newBoid.sector] = [newBoid];
            }
        }
    }

    removeBoids(boidsToRemove, ctx) {
        this.currentBoids -= boidsToRemove.length;

        for (let boid of boidsToRemove) {
            for (let sectorKey in this.boidDictionary) {
                const sectorBoids = this.boidDictionary[sectorKey];
                const index = sectorBoids.indexOf(boid);
                if (index !== -1) {
                    sectorBoids.splice(index, 1);

                    if (sectorBoids.length === 0) {
                        delete this.boidDictionary[sectorKey];
                    }
                    break;
                }
            }
        }
    }

    getNearByBoids(boid) {
        let nearbyBoids = [];
        let neighborSectors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        let current_sector = boid.sector;

        // Current sector
        if (current_sector in this.boidDictionary) {
            for (let b of this.boidDictionary[current_sector]) {
                nearbyBoids.push(b);
            }
        }

        // Neighbor sectors
        for (let [dx, dy] of neighborSectors) {
            let checkSector = `${parseInt(current_sector.split(',')[0]) + dx},${parseInt(current_sector.split(',')[1]) + dy}`;
            if (checkSector in this.boidDictionary) {
                for (let b of this.boidDictionary[checkSector]) {
                    nearbyBoids.push(b);
                }
            }
        }
        return nearbyBoids;
    }

    getNearByBlocks(boid) {
        let nearbyBlocks = [];
        let allSectors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 0], [0, 1], [1, -1], [1, 0], [1, 1]];

        for (let [dx, dy] of allSectors) {
            let checkSector = `${parseInt(boid.sector.split(',')[0]) + dx},${parseInt(boid.sector.split(',')[1]) + dy}`;
            if (this.blockDictionary[checkSector]) {
                nearbyBlocks.push(...this.blockDictionary[checkSector]);
            }
        }
        return nearbyBlocks;
    }

    moveBoidToNewSector(boid, oldSector) {
        if (oldSector in this.boidDictionary) {
            const oldSectorBoids = this.boidDictionary[oldSector];
            const index = oldSectorBoids.indexOf(boid);
            if (index !== -1) {
                oldSectorBoids.splice(index, 1);
                if (oldSectorBoids.length === 0) {
                    delete this.boidDictionary[oldSector];
                }
            }
        }

        if (boid.sector in this.boidDictionary) {
            this.boidDictionary[boid.sector].push(boid);
        } else {
            this.boidDictionary[boid.sector] = [boid];
        }
    }

    createStartingBlocks() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const offset = this.settings.SECTOR_SIZE * 5; // Distance from center

        // Top left
        this.addBlock(centerX - offset, centerY + offset, this.settings);

        // Top right
        this.addBlock(centerX + offset, centerY + offset, this.settings);

        // Bottom left
        this.addBlock(centerX - offset, centerY - offset, this.settings);

        // Bottom Right
        this.addBlock(centerX + offset, centerY - offset, this.settings);
    }

    createAdam() {
        const sectorX = Math.floor((this.width / 2) / this.settings.SECTOR_SIZE);
        const sectorY = Math.floor((this.height / 2) / this.settings.SECTOR_SIZE);
        const adamSector = `${sectorX},${sectorY}`;
        const adam = new Boid(100, 100, 1, 1, "r", this.settings.LIFESPAN, adamSector, true);

        this.currentBoids = 1;
        this.boidDictionary[adamSector] = [adam];
    }

    drawGrid(ctx) {
        let xLine = 0;
        let yLine = 0;

        ctx.strokeStyle = "rgba(128, 128, 128, 0.3)";
        ctx.lineWidth = 1;

        // Draw vertical lines
        while (xLine <= this.width) {
            ctx.beginPath();
            ctx.moveTo(xLine, 0);
            ctx.lineTo(xLine, this.height);
            ctx.stroke();
            xLine += this.settings.SECTOR_SIZE;
        }

        // Draw horizontal lines
        while (yLine <= this.height) {
            ctx.beginPath();
            ctx.moveTo(0, yLine);
            ctx.lineTo(this.width, yLine);
            ctx.stroke();
            yLine += this.settings.SECTOR_SIZE;
        }
    }
}