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

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.edgeBuffer = 50;
  }

  update(settings) {
    this.x += this.dx * settings.VELOCITY;
    this.y += this.dy * settings.VELOCITY;

    this.handleEdgeOfScreen();
    const sectorX = Math.floor(this.x / settings.SECTOR_SIZE);
    const sectorY = Math.floor(this.y / settings.SECTOR_SIZE);
    this.sector = `${sectorX},${sectorY}`;

    this.age++;
  }

  handleEdgeOfScreen() {

    if (this.x < this.edgeBuffer || this.x > this.width - this.edgeBuffer) {
      this.dx += (this.centerX - this.x) * 0.0001;  // Steer toward center X
    }
    if (this.y < this.edgeBuffer || this.y > this.height - this.edgeBuffer) {
      this.dy += (this.centerY - this.y) * 0.0001;  // Steer toward center Y
    }


    if (this.x > this.width || this.x < 0) {
      this.dx *= -1;
    }
    if (this.y > this.height || this.y < 0) {
      this.dy *= -1;
    }
  }



  handleFlocking(nearbyBoids, nearbyBlocks, settings) {
    let actualNeighbors = nearbyBoids.filter(b => b !== this);
    let sampledBoids;

    // Handle block repulsion first
    if (nearbyBlocks.length > 0) {
      for (let block of nearbyBlocks) {
        // Calculate distance to center of block sector
        let blockCenterX = block.x + (settings.SECTOR_SIZE / 2);
        let blockCenterY = block.y + (settings.SECTOR_SIZE / 2);

        let dx = blockCenterX - this.x;
        let dy = blockCenterY - this.y;
        let distanceSquared = (dx * dx) + (dy * dy);

        // Use a larger repel distance for blocks since they fill entire sectors
        let blockRepelDistance = settings.SECTOR_SIZE * 1.5;
        let blockRepelDistanceSquared = blockRepelDistance * blockRepelDistance;

        if (distanceSquared < blockRepelDistanceSquared) {
          this.repelFromBlocks(dx, dy, settings);
        }
      }
    }

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

      if (nearBoid.gene === this.gene) {
        this.cohesiveForce(nearBoid) // Fixed: changed == to ===
        this.alone = false; // Found a same-gene neighbor!
        if (this.amITooClose(distanceSquared, settings)) {
          this.adjustVectorFarther(dx, dy, settings);
        } else {
          this.adjustVectorCloser(nearBoid, settings);
        }
      } else {
        this.repelDifferentGenes(dx, dy, settings);
      }
    }
  }

  getDistanceInformation(e) {
    let dx = e.x - this.x;
    let dy = e.y - this.y;
    let distanceSquared = ((dx * dx) + (dy * dy));
    return [dx, dy, distanceSquared];
  }

  normalizeVector(dx, dy) {
    let magnitudeSquared = (dx * dx) + (dy * dy);

    if (magnitudeSquared > 0.98 && magnitudeSquared < 1.02) {
      return [dx, dy];
    }

    if (magnitudeSquared > 0) {
      let magnitude = Math.sqrt(magnitudeSquared);
      let inverseMagnitude = 1 / magnitude;
      return [dx * inverseMagnitude, dy * inverseMagnitude];
    }
    return [0, 0];
  }

  cohesiveForce(otherBoid) {
    let nudge = 0.0001;
    this.dx += (otherBoid.x > this.x) ? nudge : -nudge;
    this.dy += (otherBoid.y > this.y) ? nudge : -nudge;
  }

  adjustVectorCloser(otherBoid, settings) {
    let newDx = this.dx + (otherBoid.dx - this.dx) * settings.ADJUST_RATE;
    let newDy = this.dy + (otherBoid.dy - this.dy) * settings.ADJUST_RATE;

    let magnitude = Math.sqrt((newDx * newDx) + (newDy * newDy));

    if (magnitude > 0) {
      let inverseMagnitude = settings.VELOCITY / magnitude;
      this.dx = newDx * inverseMagnitude;
      this.dy = newDy * inverseMagnitude;
    }
  }

  adjustVectorFarther(dx, dy, settings) {
    let [repelDx, repelDy] = this.normalizeVector(-dx, -dy);

    let newDx = this.dx + repelDx * settings.ADJUST_RATE;
    let newDy = this.dy + repelDy * settings.ADJUST_RATE;

    let [normalizedDx, normalizedDy] = this.normalizeVector(newDx, newDy);

    this.dx = normalizedDx * settings.VELOCITY;
    this.dy = normalizedDy * settings.VELOCITY;
  }

  repelFromBlocks(dx, dy, settings) {
    let [repelDx, repelDy] = this.normalizeVector(-dx, -dy);

    let newDx = this.dx + repelDx * settings.BLOCK_REPEL_RATE;
    let newDy = this.dy + repelDy * settings.BLOCK_REPEL_RATE;

    let [normalizedDx, normalizedDy] = this.normalizeVector(newDx, newDy);

    this.dx = normalizedDx * settings.VELOCITY;
    this.dy = normalizedDy * settings.VELOCITY;
  }

  repelDifferentGenes(dx, dy, settings) {
    let [repelDx, repelDy] = this.normalizeVector(-dx, -dy);

    let newDx = this.dx + repelDx * settings.ADJUST_RATE;
    let newDy = this.dy + repelDy * settings.ADJUST_RATE;

    let [normalizedDx, normalizedDy] = this.normalizeVector(newDx, newDy);

    this.dx = normalizedDx * settings.VELOCITY;
    this.dy = normalizedDy * settings.VELOCITY;
  }

  amITooClose(distanceSquared, settings) {
    // Calculate DENSITY_DISTANCE_SQUARED dynamically
    const densityDistanceSquared = settings.DENSITY_DISTANCE * settings.DENSITY_DISTANCE;
    return distanceSquared < densityDistanceSquared;
  }
}