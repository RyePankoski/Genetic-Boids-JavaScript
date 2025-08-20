import { useEffect } from 'react';
import './App.css';
import { BoidManager } from './BoidManager.js';

function App() {
  useEffect(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to full window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const boidManager = new BoidManager();

    // FPS control variables
    let lastTime = 0;
    const targetFPS = 30; // Change this to your desired FPS
    const frameInterval = 1000 / targetFPS;

    function gameLoop(currentTime) {
      const deltaTime = currentTime - lastTime;

      // Only update if enough time has passed
      if (deltaTime >= frameInterval) {
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Run simulation
        boidManager.run(ctx);

        lastTime = currentTime;
      }

      requestAnimationFrame(gameLoop);
    }

    gameLoop();
  }, []);

  return (
    <div className="App">
      <canvas
        id="canvas"
        style={{
          display: 'block',
          border: '1px solid black'
        }}
      />
    </div>
  );
}

export default App;