# Genetic Boids Simulation

**Portfolio Showcase Project**

A flocking simulation combining genetic algorithms and real-time graphics programming. 
This project showcases implementation of complex algorithms, performance optimization, and intuitive user interface design.

## Live Demo

<img width="2554" height="1298" alt="Screenshot 2025-08-22 185934" src="https://github.com/user-attachments/assets/1c4af4de-dbba-482e-94c3-7b2ee4d4fc0a" />

**[Try the Simulation](https://ryepankoski.github.io/Genetic-Boids-JavaScript/)**

No installation required - runs directly in your browser.

## Project Overview

This simulation implements Reynolds' classic boids algorithm with genetic evolution, creating emergent behaviors from simple rules. 
Each boid carries genetic information that influences its behavior and appearance, and was added to make the flocks more dynamic and interesting to watch.

**Key Technical Achievements:**
- Custom flocking algorithm with separation, alignment, and cohesion behaviors
- Genetic algorithm with mutation and inheritance
- Spatial hash grid optimization reducing neighbor detection from O(n²) to O(n)
- Real-time parameter adjustment supporting 1000+ concurrent entities. (This depends on hardware too)
- Interactive obstacle placement with drag-and-drop interface

## Skills Demonstrated

**Programming & Algorithms**
- JavaScript ES6+ with modern React patterns
- Object-oriented design and algorithm optimization
- Mathematical modeling and vector calculations
- Performance analysis and Big O optimization

**System Design**
- Modular architecture with clear separation of concerns
- Event-driven simulation with real-time parameter updates
- Efficient memory management for dynamic populations

**User Experience**
- Intuitive interface with guided tour system
- Real-time visualization of complex parameters
- Educational content explaining underlying concepts

## Architecture

**Core Classes:**
- `BoidManager`: Handles simulation state and population lifecycle
- `Boid`: Individual agents implementing flocking and genetic behaviors  
- `Block`: Interactive obstacles with collision detection
- `SoundManager`: Audio feedback system

**Performance Optimizations:**
- Sector-based spatial partitioning for efficient collision detection
- Neighbor sampling to limit computational overhead
- Frame rate control maintaining smooth 30 FPS performance

## Getting Started

### Run Locally (Optional)

For development or contributions:

```bash
git clone https://github.com/yourusername/genetic-boids-simulation.git
cd genetic-boids-simulation
npm install
npm start
```

### Usage

1. Launch the simulation and follow the guided tour
2. Adjust parameters in real-time using the control panel
3. Place obstacles by dragging blocks from the tray
4. Read the educational journal via "How It Works"

## Key Parameters

- **Velocity**: Movement speed of boids
- **Sector Size**: Spatial partitioning resolution
- **Gene Bias**: Strength of genetic inheritance
- **Color Mutation**: Rate of genetic variation
- **Population Dynamics**: Birth rates and lifespan controls

## Contributing

Contributions welcome! Areas of interest include:
- Performance optimizations
- Additional genetic traits
- Mobile responsiveness
- Educational content expansion

## References

- Reynolds, C. W. (1987). "Flocks, herds and schools: A distributed behavioral model"
- Goldberg, D. E. (1989). "Genetic Algorithms in Search, Optimization and Machine Learning"

## Contact


- **Portfolio**: [(https://github.com/RyePankoski?tab=repositories)]
- **Email**: ryedpankoski@gmail.com
