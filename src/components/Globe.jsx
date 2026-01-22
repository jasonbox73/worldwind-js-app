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

    // Add a Blue Marble imagery layer (satellite imagery of Earth)
    // This provides the visual texture for the globe surface
    const blueMarbleLayer = new WorldWind.BMNGOneImageLayer();
    wwd.addLayer(blueMarbleLayer);

    // Add atmosphere layer for realistic edge glow
    const atmosphereLayer = new WorldWind.AtmosphereLayer();
    wwd.addLayer(atmosphereLayer);

    // Add star field background for context when zoomed out
    const starFieldLayer = new WorldWind.StarFieldLayer();
    wwd.addLayer(starFieldLayer);

    // Trigger initial render
    wwd.redraw();

    // Cleanup function: Called when component unmounts
    // WorldWind doesn't have a built-in destroy method, but we clear our reference
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
