export class Block {
    constructor(x, y, settings) {
        this.x = x;
        this.y = y;
        this.settings = settings;
        this.sectorX = Math.floor(this.x / settings.SECTOR_SIZE);
        this.sectorY = Math.floor(this.y / settings.SECTOR_SIZE);
    }

    updateSector(newSectorSize) {
        this.sectorX = Math.floor(this.x / newSectorSize);
        this.sectorY = Math.floor(this.y / newSectorSize);
    }
}