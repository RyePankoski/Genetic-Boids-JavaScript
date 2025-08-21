import { useEffect, useState, useRef } from 'react';
import './App.css';
import { BoidManager } from './BoidManager.js';

function App() {
  // Initialize settings as React state
  const [settings, setSettings] = useState({
    SECTOR_SIZE: 50,
    VELOCITY: 1.5,
    MAX_BOIDS: 1000,
    ADJUST_RATE: 0.008,
    REPEL_RATE: 0.1,
    DENSITY_DISTANCE: 15,
    MAX_FLOCKING_NEIGHBORS: 10,
    LIFESPAN: 200,
    BIRTHRATE: 4,
    GENE_BIAS_FACTOR: 5,
    COLOR_MUTATION: 20,
    MIN_LIFESPAN: 20,
    MILESTONE: 100,
    BLOCK_REPEL_RATE: 0.4,
  });

  // Tour state
  const [tourStep, setTourStep] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showParameterHint, setShowParameterHint] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showObstacleHint, setShowObstacleHint] = useState(false);
  const [showObstacleTray, setShowObstacleTray] = useState(false);

  // Journal state
  const [showJournal, setShowJournal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Obstacle/Block state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Store BoidManager instance in a ref
  const boidManagerRef = useRef(null);
  const animationIdRef = useRef(null);

  // Add this array of your journal page images (replace with your actual image paths)
  const journalPages = [
    './images/page1.png',  // Replace with your image paths
    './images/page2.png',
    './images/page3.png',
    './images/page4.png',
    './images/page5.png',
    // Add more pages as needed
  ];

  // Journal navigation functions
  const nextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, journalPages.length - 1));
  };

  const prevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  const closeJournal = () => {
    setShowJournal(false);
    setCurrentPage(0); // Reset to first page when closing
  };

  // Handle obstacle placement
  const handleCanvasMouseDown = (e) => {
    if (!isDragging) return;
    
    const canvas = document.getElementById('canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Place block at this position
    if (boidManagerRef.current) {
      boidManagerRef.current.addBlock(x, y, settings);
    }
    
    setIsDragging(false);
  };

  const handleObstacleDragStart = (e) => {
    setIsDragging(true);
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  };

  // Handle input changes
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0
    }));
  };

  // Tour sequence - only runs after simulation starts
  useEffect(() => {
    if (!simulationStarted) return;

    const timers = [];

    // Step 1: Show welcome message after 1 second
    timers.push(setTimeout(() => {
      setShowWelcome(true);
      setTourStep(1);
    }, 1000));

    // Step 2: Hide welcome message after 5 seconds
    timers.push(setTimeout(() => {
      setShowWelcome(false);
    }, 5000));

    // Step 3: Show controls and parameter hint after 15 seconds
    timers.push(setTimeout(() => {
      setShowControls(true);
      setShowParameterHint(true);
      setTourStep(2);
    }, 15000));

    // Step 4: Hide parameter hint after 20 seconds
    timers.push(setTimeout(() => {
      setShowParameterHint(false);
      setTourStep(3);
    }, 20000));

    // Step 5: Show how it works option after 20 seconds
    timers.push(setTimeout(() => {
      setShowHowItWorks(true);
      setTourStep(4);
    }, 15000));

    // Step 6: Show obstacle hint after 40 seconds
    timers.push(setTimeout(() => {
      setShowObstacleHint(true);
      setTourStep(5);
    }, 40000));

    // Step 7: Show obstacle tray after 45 seconds
    timers.push(setTimeout(() => {
      setShowObstacleTray(true);
      setShowObstacleHint(false);
      setTourStep(6);
    }, 45000));

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [simulationStarted]);

  // Main simulation effect - only runs after simulation starts
  useEffect(() => {
    if (!simulationStarted) return;

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size to full window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create or update BoidManager with current settings
    if (!boidManagerRef.current) {
      boidManagerRef.current = new BoidManager(settings);
    } else {
      // Update existing BoidManager settings
      boidManagerRef.current.updateSettings(settings);
    }

    // FPS control variables
    let lastTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    function gameLoop(currentTime) {
      const deltaTime = currentTime - lastTime;

      // Only update if enough time has passed
      if (deltaTime >= frameInterval) {
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Run simulation with current settings
        boidManagerRef.current.run(ctx);

        lastTime = currentTime;
      }

      animationIdRef.current = requestAnimationFrame(gameLoop);
    }

    gameLoop();

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [settings, simulationStarted]);

  // Keyboard navigation for journal
  useEffect(() => {
    if (!showJournal) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        prevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        nextPage();
      } else if (e.key === 'Escape') {
        closeJournal();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showJournal, currentPage]);

  return (
    <div className="App">
      <canvas
        id="canvas"
        style={{
          display: 'block',
          border: '1px solid black',
          cursor: isDragging ? 'crosshair' : 'default'
        }}
        onMouseDown={handleCanvasMouseDown}
      />

      {/* Start Simulation Overlay */}
      {!simulationStarted && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '60px',
            marginBottom: '20px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            Boid Simulation
          </h1>
          <p style={{
            color: 'white',
            fontSize: '20px',
            marginBottom: '40px',
            opacity: 0.9
          }}>
            Watch boids flock and evolve.
          </p>
          <button
            onClick={() => setSimulationStarted(true)}
            style={{
              padding: '20px 50px',
              fontSize: '24px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            Start Simulation
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '48px',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        opacity: showWelcome ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        pointerEvents: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        The Genetic Boids
        <div style={{ fontSize: '24px', marginTop: '20px', opacity: 0.8 }}>
          Watch emergent behaviors arise from simple rules.
        </div>
      </div>

      {/* Parameter Hint */}
      <div style={{
        position: 'absolute',
        top: '50%',
        right: showParameterHint ? '350px' : '400px',
        transform: 'translateY(-50%)',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        opacity: showParameterHint ? 1 : 0,
        transition: 'all 0.8s ease-in-out',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
      }}>
        <span style={{ fontSize: '32px' }}></span>
        Try adjusting the parameters!
      </div>

      {/* Obstacle Hint */}
      <div style={{
        position: 'absolute',
        top: '60%',
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'white',
        fontSize: '28px',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        opacity: showObstacleHint ? 1 : 0,
        transition: 'opacity 1s ease-in-out',
        pointerEvents: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        🧱 Try adding obstacles!
        <div style={{ fontSize: '18px', marginTop: '10px', opacity: 0.8 }}>
          Drag blocks from the tray to create barriers.
        </div>
      </div>

      {/* Obstacle Tray */}
      {showObstacleTray && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          border: '2px solid #555',
          opacity: showObstacleTray ? 1 : 0,
          transform: showObstacleTray ? 'translateX(0)' : 'translateX(20px)',
          transition: 'all 0.8s ease-in-out'
        }}>
          <h4 style={{ 
            color: 'white', 
            margin: '0 0 10px 0', 
            fontSize: '14px',
            textAlign: 'center'
          }}>
            Obstacles
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: 'center'
          }}>
            {/* Draggable block */}
            <div
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
                border: '2px solid #654321',
                borderRadius: '4px',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                userSelect: 'none'
              }}
              onMouseDown={handleObstacleDragStart}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🧱
            </div>
            <div style={{
              color: '#ccc',
              fontSize: '11px',
              textAlign: 'center',
              maxWidth: '80px'
            }}>
              Drag to place
            </div>
          </div>
        </div>
      )}

      {/* How It Works Button */}
      {showHowItWorks && !showJournal && (
        <button
          onClick={() => setShowJournal(true)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            padding: '15px 25px',
            background: 'rgba(139, 69, 19, 0.9)', // Brown book-like color
            color: 'white',
            border: '2px solid #8B4513',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            opacity: showHowItWorks ? 1 : 0,
            transform: showHowItWorks ? 'translateY(0)' : 'translateY(20px)',
            fontFamily: 'serif'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(160, 82, 45, 0.9)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(139, 69, 19, 0.9)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          📖 How It Works
        </button>
      )}

      {/* Journal Modal */}
      {showJournal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            background: '#2c1810', // Dark brown book binding
            borderRadius: '15px',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            border: '3px solid #8B4513'
          }}>
            {/* Close Button */}
            <button
              onClick={closeJournal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: '#D2B48C',
                fontSize: '24px',
                cursor: 'pointer',
                fontWeight: 'bold',
                zIndex: 2001
              }}
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = '#D2B48C'}
            >
              ✕
            </button>

            {/* Journal Page */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh'
            }}>
              <img
                src={journalPages[currentPage]}
                alt={`Journal page ${currentPage + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Navigation Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '20px',
              padding: '0 20px'
            }}>
              {/* Previous Button */}
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                style={{
                  padding: '10px 20px',
                  background: currentPage === 0 ? 'rgba(139, 69, 19, 0.3)' : 'rgba(139, 69, 19, 0.8)',
                  color: currentPage === 0 ? '#666' : 'white',
                  border: '1px solid #8B4513',
                  borderRadius: '5px',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontFamily: 'serif',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage > 0) {
                    e.target.style.background = 'rgba(160, 82, 45, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage > 0) {
                    e.target.style.background = 'rgba(139, 69, 19, 0.8)';
                  }
                }}
              >
                ← Previous
              </button>

              {/* Page Indicator */}
              <div style={{
                color: '#D2B48C',
                fontSize: '16px',
                fontFamily: 'serif',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>Page {currentPage + 1} of {journalPages.length}</span>
                
                {/* Page Dots */}
                <div style={{ display: 'flex', gap: '5px' }}>
                  {journalPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        border: 'none',
                        background: index === currentPage ? '#D2B48C' : 'rgba(210, 180, 140, 0.3)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (index !== currentPage) {
                          e.target.style.background = 'rgba(210, 180, 140, 0.6)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== currentPage) {
                          e.target.style.background = 'rgba(210, 180, 140, 0.3)';
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={nextPage}
                disabled={currentPage === journalPages.length - 1}
                style={{
                  padding: '10px 20px',
                  background: currentPage === journalPages.length - 1 ? 'rgba(139, 69, 19, 0.3)' : 'rgba(139, 69, 19, 0.8)',
                  color: currentPage === journalPages.length - 1 ? '#666' : 'white',
                  border: '1px solid #8B4513',
                  borderRadius: '5px',
                  cursor: currentPage === journalPages.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontFamily: 'serif',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage < journalPages.length - 1) {
                    e.target.style.background = 'rgba(160, 82, 45, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage < journalPages.length - 1) {
                    e.target.style.background = 'rgba(139, 69, 19, 0.8)';
                  }
                }}
              >
                Next →
              </button>
            </div>

            {/* Keyboard Hints */}
            <div style={{
              textAlign: 'center',
              marginTop: '15px',
              color: '#999',
              fontSize: '12px',
              fontFamily: 'serif'
            }}>
              Use arrow keys or A/D to navigate • ESC to close
            </div>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '12px',
        maxHeight: '90vh',
        overflowY: 'auto',
        minWidth: '250px',
        opacity: showControls ? 1 : 0,
        transform: showControls ? 'translateX(0)' : 'translateX(20px)',
        transition: 'all 0.8s ease-in-out',
        pointerEvents: showControls ? 'auto' : 'none'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Simulation Controls</h3>

        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '10px 0 5px 0' }}>Movement</h4>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Sector Size: {settings.SECTOR_SIZE}
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={settings.SECTOR_SIZE}
              onChange={(e) => handleSettingChange('SECTOR_SIZE', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Velocity: {settings.VELOCITY}
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={settings.VELOCITY}
              onChange={(e) => handleSettingChange('VELOCITY', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Adjust Rate: {settings.ADJUST_RATE}
            <input
              type="range"
              min="0.001"
              max="0.05"
              step="0.001"
              value={settings.ADJUST_RATE}
              onChange={(e) => handleSettingChange('ADJUST_RATE', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Repel Rate: {settings.REPEL_RATE}
            <input
              type="range"
              min="0.001"
              max="0.05"
              step="0.001"
              value={settings.REPEL_RATE}
              onChange={(e) => handleSettingChange('REPEL_RATE', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '10px 0 5px 0' }}>Flocking</h4>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Density Distance: {settings.DENSITY_DISTANCE}
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={settings.DENSITY_DISTANCE}
              onChange={(e) => handleSettingChange('DENSITY_DISTANCE', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Max Neighbors: {settings.MAX_FLOCKING_NEIGHBORS}
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={settings.MAX_FLOCKING_NEIGHBORS}
              onChange={(e) => handleSettingChange('MAX_FLOCKING_NEIGHBORS', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '10px 0 5px 0' }}>Population</h4>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Max Boids: {settings.MAX_BOIDS}
            <input
              type="range"
              min="100"
              max="5000"
              step="100"
              value={settings.MAX_BOIDS}
              onChange={(e) => handleSettingChange('MAX_BOIDS', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Lifespan: {settings.LIFESPAN}
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={settings.LIFESPAN}
              onChange={(e) => handleSettingChange('LIFESPAN', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Birth Rate: {settings.BIRTHRATE}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={settings.BIRTHRATE}
              onChange={(e) => handleSettingChange('BIRTHRATE', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '10px 0 5px 0' }}>Genetics</h4>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Gene Bias: {settings.GENE_BIAS_FACTOR}
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={settings.GENE_BIAS_FACTOR}
              onChange={(e) => handleSettingChange('GENE_BIAS_FACTOR', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '8px' }}>
            Color Mutation: {settings.COLOR_MUTATION}
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={settings.COLOR_MUTATION}
              onChange={(e) => handleSettingChange('COLOR_MUTATION', e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </label>
        </div>

        <button
          onClick={() => {
            // Reset simulation
            boidManagerRef.current = new BoidManager(settings);
          }}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '10px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background 0.3s',
          }}
          onMouseEnter={(e) => e.target.style.background = '#45a049'}
          onMouseLeave={(e) => e.target.style.background = '#4CAF50'}
        >
          Reset Simulation
        </button>

        {/* Skip Tour Button (only during tour) */}
        {tourStep < 6 && (
          <button
            onClick={() => {
              setShowWelcome(false);
              setShowParameterHint(false);
              setShowObstacleHint(false);
              setShowControls(true);
              setShowObstacleTray(true);
              setTourStep(6);
            }}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '10px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            Skip Tour
          </button>
        )}
      </div>
    </div>
  );
}

export default App;