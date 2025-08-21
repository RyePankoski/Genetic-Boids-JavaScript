export function handleGenes(boid, parentBoid, settings){
    let [r,g,b] = parentBoid.rgb;
    
    // Apply bias to parent's primary gene BEFORE mutation
    if (parentBoid.gene === 'r') {
        r += settings.GENE_BIAS_FACTOR;
    } else if (parentBoid.gene === 'g') {
        g += settings.GENE_BIAS_FACTOR;
    } else if (parentBoid.gene === 'b') {
        b += settings.GENE_BIAS_FACTOR;
    }
    
    // Apply random mutations
    r += Math.random() * (2 * settings.COLOR_MUTATION) - settings.COLOR_MUTATION;
    g += Math.random() * (2 * settings.COLOR_MUTATION) - settings.COLOR_MUTATION;
    b += Math.random() * (2 * settings.COLOR_MUTATION) - settings.COLOR_MUTATION;
    
    // Clamp values to valid RGB range
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    // Determine gene based on highest color value (with proper tie handling)
    let maxValue = Math.max(r, g, b);
    let winners = [];
    if (r === maxValue) winners.push('r');
    if (g === maxValue) winners.push('g');
    if (b === maxValue) winners.push('b');
    
    // Randomly select from tied winners
    boid.gene = winners[Math.floor(Math.random() * winners.length)];
    
    // Apply lifespan variation
    boid.lifespan += Math.random() * 60 - 30;
    
    // Set final RGB values
    boid.rgb = [r, g, b];
}

export function drawBoids(boid, ctx) {
    const r = Math.floor(boid.rgb[0]);
    const g = Math.floor(boid.rgb[1]);
    const b = Math.floor(boid.rgb[2]);
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.beginPath();
    ctx.arc(boid.x, boid.y, 3, 0, 2 * Math.PI);
    ctx.fill();
}
    
export function drawDeath(x,y,ctx){
    ctx.fillStyle = "yellow";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 50, y - 50);
    ctx.lineTo(x + 50, y + 50);
    ctx.moveTo(x + 50, y - 50);
    ctx.lineTo(x - 50, y + 50);
    ctx.stroke();
}