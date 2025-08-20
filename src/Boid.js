import { settings } from "./Settings.js";

export class Boid {
  constructor(x, y, dx, dy, gene, lifespan, sector, amIadam) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.gene = gene;
    this.lifespan = lifespan;
    this.sector = sector;
    this.amIadam = amIadam;

    this.age = 0;
    this.rgb = [100, 100, 100];

    this.alone = false;

    const canvas = document.getElementById('canvas');
    this.width = canvas.width;
    this.height = canvas.height;
  }

  update() {
    this.x += this.dx * settings.VELOCITY;
    this.y += this.dy * settings.VELOCITY;

    if (this.x > this.width || this.x < 0) {
      this.dx *= -1;
    }

    if (this.y > this.height || this.y < 0) {
      this.dy *= -1;
    }

    const sectorX = Math.floor(this.x / settings.SECTOR_SIZE);
    const sectorY = Math.floor(this.y / settings.SECTOR_SIZE);
    this.sector = `${sectorX},${sectorY}`;

    this.age++;
  }

  handleFlocking(nearbyBoids) {

    let actualNeighbors = nearbyBoids.filter(b => b !== this);
    let sampledBoids;

    if (actualNeighbors.length > settings.MAX_FLOCKING_NEIGHBORS) {
      sampledBoids = [];
      const used = new Set();
      while (sampledBoids.length < settings.MAX_FLOCKING_NEIGHBORS) {
        const randomIndex = Math.floor(Math.random() * actualNeighbors.length);
        if (!used.has(randomIndex)) {
          used.add(randomIndex);
          sampledBoids.push(actualNeighbors[randomIndex]);
        }
      }
    } else {
      sampledBoids = actualNeighbors;
    }


    this.alone = true;

    for (let nearBoid of sampledBoids) {
      let [dx, dy, distanceSquared] = this.getDistanceInformation(nearBoid);

      if (nearBoid.gene == this.gene) {
        this.alone = false; // Found a same-gene neighbor!
        if (this.amITooClose(distanceSquared)) {
          this.adjustVectorFarther(dx, dy);
        } else {
          this.adjustVectorCloser(nearBoid);
        }
      } else {
        this.repelDifferentGenes(dx, dy);
      }
    }
  }

  getDistanceInformation(otherBoid) {
    let dx = otherBoid.x - this.x;
    let dy = otherBoid.y - this.y;
    let distanceSquared = ((dx * dx) + (dy * dy));
    return [dx, dy, distanceSquared];
  }

  normalizeVector(dx, dy) {
    let magnitudeSquared = (dx * dx) + (dy * dy);

    if (magnitudeSquared > 0.999 && magnitudeSquared < 1.0001) {
      return [dx, dy];
    }

    if (magnitudeSquared > 0) {
      let magnitude = Math.sqrt(magnitudeSquared);
      let inverseMagnitude = 1 / magnitude;
      return [dx * inverseMagnitude, dy * inverseMagnitude];
    }
    return [0, 0];
  }

  adjustVectorCloser(otherBoid) {
    let newDx = this.dx + (otherBoid.dx - this.dx) * settings.ADJUST_RATE;
    let newDy = this.dy + (otherBoid.dy - this.dy) * settings.ADJUST_RATE;

    let magnitude = Math.sqrt((newDx * newDx) + (newDy * newDy));

    if (magnitude > 0) {
      let inverseMagnitude = settings.VELOCITY / magnitude;
      this.dx = newDx * inverseMagnitude;
      this.dy = newDy * inverseMagnitude;
    }
  }

  adjustVectorFarther(dx, dy) {
    let [repelDx, repelDy] = this.normalizeVector(-dx, -dy);

    let newDx = this.dx + repelDx * settings.ADJUST_RATE;
    let newDy = this.dy + repelDy * settings.ADJUST_RATE;

    let [normalizedDx, normalizedDy] = this.normalizeVector(newDx, newDy);

    this.dx = normalizedDx * settings.VELOCITY;
    this.dy = normalizedDy * settings.VELOCITY;
  }

  repelDifferentGenes(dx, dy) {
    let [repelDx, repelDy] = this.normalizeVector(-dx, -dy);

    let newDx = this.dx + repelDx * settings.ADJUST_RATE;
    let newDy = this.dy + repelDy * settings.ADJUST_RATE;

    let [normalizedDx, normalizedDy] = this.normalizeVector(newDx, newDy);

    this.dx = normalizedDx * settings.VELOCITY;
    this.dy = normalizedDy * settings.VELOCITY;
  }

  amITooClose(distanceSquared) {
    return distanceSquared < settings.DENSITY_DISTANCE_SQUARED;
  }
}