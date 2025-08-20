import { settings } from "./Settings.js";
import { Boid } from "./Boid.js";
import { handleGenes, drawBoids } from "./Utils.js";

export class BoidManager {  // Add export and fix class name
    constructor() {
        const canvas = document.getElementById('canvas');
        this.width = canvas.width;
        this.height = canvas.height;
        this.boidDictionary = {};
        this.createAdam();
    }

    run(ctx) {
        let boidsToRemove = [];
        let parentsToReproduce = [];  // Just store the parent boids directly

        if (this.currentBoids <= 0) {
            this.createAdam();
        }

        Object.values(this.boidDictionary).forEach(sectorBoids => {
            [...sectorBoids].forEach(boid => {
                let nearbyBoids = this.getNearByBoids(boid);

                drawBoids(boid, ctx);

                let oldSector = boid.sector;
                boid.update();
                boid.handleFlocking(nearbyBoids);

                if (boid.sector !== oldSector) {
                    this.moveBoidToNewSector(boid, oldSector);
                }

                if (boid.age >= boid.lifespan) {
                    boidsToRemove.push(boid);
                    parentsToReproduce.push(boid);  // No object creation
                }
            });
        });

        if (parentsToReproduce.length > 0) {
            for (let parent of parentsToReproduce) {  // Simple loop, no destructuring
                this.addBoids(parent, settings.BIRTHRATE);
            }
        }

        if (boidsToRemove.length > 0) {
            this.removeBoids(boidsToRemove, ctx);
        }
    }

    addBoids(parentBoid, number) {

        let populationPressure = this.currentBoids / settings.MAX_BOIDS;
        let reproductionChance = Math.max(0.1, 1 - populationPressure);

        if (Math.random() > reproductionChance) {
            return;
        }

        if (parentBoid.lifespan <= settings.MIN_LIFESPAN) {
            return;
        }

        if (parentBoid.alone == true && parentBoid.amIadam == false) {
            return;
        }



        for (let i = 0; i < number; i++) {
            this.currentBoids += 1;
            let newDx = parentBoid.dx + Math.random() * 0.2 - 0.1;
            let newDy = parentBoid.dy + Math.random() * 0.2 - 0.1;

            let sectorX = Math.floor(parentBoid.x / settings.SECTOR_SIZE);
            let sectorY = Math.floor(parentBoid.y / settings.SECTOR_SIZE);
            let sector = `${sectorX},${sectorY}`;

            let newBoid = new Boid(parentBoid.x, parentBoid.y, newDx, newDy, parentBoid.gene, settings.LIFESPAN, sector, false)

            handleGenes(newBoid, parentBoid)


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

    createAdam() {
        const sectorX = Math.floor((this.width / 2) / settings.SECTOR_SIZE);
        const sectorY = Math.floor((this.height / 2) / settings.SECTOR_SIZE);

        const adamSector = `${sectorX},${sectorY}`;
        const adam = new Boid(100, 100, 1, 1, "r", settings.LIFESPAN, adamSector, true);

        this.currentBoids = 1;
        this.boidDictionary[adamSector] = [adam];
    }


    recalculateAllBoidSectors() {
        let newDictionary = {};

        Object.values(this.boidDictionary).forEach(sectorBoids => {
            sectorBoids.forEach(boid => {
                let newSectorX = Math.floor(boid.x / settings.SECTOR_SIZE);
                let newSectorY = Math.floor(boid.y / settings.SECTOR_SIZE);
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

}

