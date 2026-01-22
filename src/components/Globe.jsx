import { useEffect, useRef } from 'react';
import WorldWind from 'worldwindjs';
import { createOverlayLayer } from '../layers/createOverlayLayer';

/**
 * Globe component that renders an interactive 3D Earth using NASA Web WorldWind.
 *
 * @param {Object} props
 * @param {boolean} props.overlayEnabled - Whether to show the overlay layer
 */
function Globe({ overlayEnabled = false }) {
  // Ref to access the canvas DOM element
  const canvasRef = useRef(null);
  // Ref to store the WorldWindow instance (prevents re-initialization)
  const wwRef = useRef(null);
  // Ref to store the overlay layer for toggling
  const overlayLayerRef = useRef(null);

  // Initialize WorldWind on mount
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
    const wwd = new WorldWind.WorldWindow(canvas);
    wwRef.current = wwd;

    // Layers are rendered in order: first added = bottom, last added = top
    wwd.addLayer(new WorldWind.StarFieldLayer());
    wwd.addLayer(new WorldWind.BMNGLayer());
    wwd.addLayer(new WorldWind.AtmosphereLayer());

    // Create overlay layer (initially hidden)
    const overlayLayer = createOverlayLayer();
    overlayLayer.enabled = false;
    overlayLayerRef.current = overlayLayer;
    wwd.addLayer(overlayLayer);

    // Set initial camera position
    wwd.navigator.range = 20000000;
    wwd.navigator.tilt = 50;

    // Center on North America for better view of US boundary
    wwd.navigator.lookAtLocation.latitude = 35;
    wwd.navigator.lookAtLocation.longitude = -100;

    wwd.redraw();

    return () => {
      wwRef.current = null;
      overlayLayerRef.current = null;
    };
  }, []);

  // Toggle overlay layer when prop changes
  useEffect(() => {
    const overlayLayer = overlayLayerRef.current;
    const wwd = wwRef.current;

    if (overlayLayer && wwd) {
      overlayLayer.enabled = overlayEnabled;
      wwd.redraw();
    }
  }, [overlayEnabled]);

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
