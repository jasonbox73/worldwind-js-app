import { useEffect, useRef } from 'react';
import WorldWind from 'worldwindjs';

/**
 * Globe component that renders an interactive 3D Earth using NASA Web WorldWind.
 *
 * Key concepts:
 * - WorldWind.WorldWindow: The main object that manages the WebGL canvas and rendering
 * - Layers: Visual elements stacked on the globe (imagery, atmosphere, etc.)
 * - Navigator: Controls camera position and handles user input for rotation/zoom
 */
function Globe() {
  // Ref to access the canvas DOM element
  const canvasRef = useRef(null);
  // Ref to store the WorldWindow instance (prevents re-initialization)
  const wwRef = useRef(null);

  useEffect(() => {
    // Guard: Only initialize once
    if (wwRef.current) {
      return;
    }

    // Guard: Ensure canvas element exists
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    // Create the WorldWindow instance attached to our canvas
    // This initializes WebGL context and sets up the rendering pipeline
    const wwd = new WorldWind.WorldWindow(canvas);
    wwRef.current = wwd;

    // Layers are rendered in order: first added = bottom, last added = top
    // Star field goes at the bottom (background)
    wwd.addLayer(new WorldWind.StarFieldLayer());

    // Add Blue Marble tiled imagery layer (loads progressively as tiles)
    // BMNGLayer uses tiled images which are more reliable than BMNGOneImageLayer
    wwd.addLayer(new WorldWind.BMNGLayer());

    // Add atmosphere layer on top for realistic edge glow
    wwd.addLayer(new WorldWind.AtmosphereLayer());

    // Set initial camera position
    wwd.navigator.range = 20000000; // ~20,000 km - shows full Earth
    wwd.navigator.tilt = 50; // Tilt 50° toward horizon to show stars in background

    // Trigger initial render
    wwd.redraw();

    // Cleanup function: Called when component unmounts
    return () => {
      wwRef.current = null;
    };
  }, []); // Empty dependency array: run only on mount

  return (
    <canvas
      ref={canvasRef}
      className="globe-canvas"
    >
      Your browser does not support HTML5 Canvas.
    </canvas>
  );
}

export default Globe;
