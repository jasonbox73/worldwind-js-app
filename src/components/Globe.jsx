import { useEffect, useRef, useState, useCallback } from 'react';
import WorldWind from 'worldwindjs';
import { createOverlayLayer } from '../layers/createOverlayLayer';
import { createDefenseDomes } from '../layers/createDefenseDomes';
import { createUSBorderLayer } from '../layers/createUSBorderLayer';
import { createSensorLayer } from '../layers/createSensorLayer';
import { AnimationController } from '../utils/AnimationController';
import { createAnimatedDetectionEvents } from '../layers/AnimatedDetectionEvents';
import { createAnimatedSatellites } from '../layers/AnimatedSatellites';

/**
 * Globe component that renders an interactive 3D Earth using NASA Web WorldWind.
 *
 * @param {Object} props
 * @param {Object} props.layerStates - Object containing enabled state for each layer
 */
function Globe({ layerStates = {} }) {
  // Ref to access the canvas DOM element
  const canvasRef = useRef(null);
  // Ref to store the WorldWindow instance (prevents re-initialization)
  const wwRef = useRef(null);
  // Refs to store all layers for toggling
  const layersRef = useRef({});
  // Ref to store the animation controller
  const animationControllerRef = useRef(null);
  // Ref to store animated detection events
  const animatedEventsRef = useRef([]);
  // State for coordinate display
  const [coords, setCoords] = useState(null);

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

    // Configure WorldWind image path for view controls
    WorldWind.configuration.baseUrl = '/';

    // Create the WorldWindow instance attached to our canvas
    const wwd = new WorldWind.WorldWindow(canvas);
    wwRef.current = wwd;

    // Base layers (always visible)
    const starFieldLayer = new WorldWind.StarFieldLayer();
    const atmosphereLayer = new WorldWind.AtmosphereLayer();

    // Enhanced atmosphere for better visuals
    atmosphereLayer.lightLocation = WorldWind.SunPosition.getAsGeographicLocation(new Date());

    wwd.addLayer(starFieldLayer);
    wwd.addLayer(new WorldWind.BMNGOneImageLayer());
    wwd.addLayer(atmosphereLayer);

    // Create defense dome layers
    const defenseDomes = createDefenseDomes();
    layersRef.current.terminal = defenseDomes.terminal;
    layersRef.current.midcourse = defenseDomes.midcourse;
    layersRef.current.spaceBased = defenseDomes.spaceBased;

    // Add defense layers (initially hidden)
    defenseDomes.terminal.enabled = false;
    defenseDomes.midcourse.enabled = false;
    defenseDomes.spaceBased.enabled = false;
    wwd.addLayer(defenseDomes.terminal);
    wwd.addLayer(defenseDomes.midcourse);
    wwd.addLayer(defenseDomes.spaceBased);

    // Create animation controller
    const animationController = new AnimationController(wwd);
    animationControllerRef.current = animationController;

    // Create sensor layer with static elements (initially hidden)
    const sensorLayer = createSensorLayer();
    sensorLayer.enabled = false;
    layersRef.current.sensors = sensorLayer;
    wwd.addLayer(sensorLayer);

    // Create animated detection events layer
    const animatedEventsLayer = new WorldWind.RenderableLayer('Animated Detection Events');
    const animatedEvents = createAnimatedDetectionEvents(animationController);
    animatedEventsRef.current = animatedEvents;

    // Add all animated event renderables to the layer
    animatedEvents.forEach(event => {
      event.getRenderables().forEach(renderable => {
        animatedEventsLayer.addRenderable(renderable);
      });
    });

    animatedEventsLayer.enabled = false;
    layersRef.current.animatedEvents = animatedEventsLayer;
    wwd.addLayer(animatedEventsLayer);

    // Create animated satellites layer (async due to model loading)
    const animatedSatellitesLayer = new WorldWind.RenderableLayer('Animated Satellites');
    layersRef.current.animatedSatellites = animatedSatellitesLayer;
    animatedSatellitesLayer.enabled = true;
    wwd.addLayer(animatedSatellitesLayer);

    // Load satellites asynchronously
    createAnimatedSatellites(animationController).then(animatedSatellites => {
      // Add all satellite renderables to the layer
      animatedSatellites.forEach(satellite => {
        animatedSatellitesLayer.addRenderable(satellite.getRenderable());
      });

      console.log('3D satellites loaded:', animatedSatellites.length);
      wwd.redraw();
    }).catch(error => {
      console.error('Failed to load satellite models:', error);
    });

    // Start animation loop
    animationController.start();

    // Create US border layer (initially enabled for visibility)
    const usBorderLayer = createUSBorderLayer();
    usBorderLayer.enabled = true;
    layersRef.current.usBorder = usBorderLayer;
    wwd.addLayer(usBorderLayer);

    // Create overlay layer (grid/boundaries, initially hidden)
    const overlayLayer = createOverlayLayer();
    overlayLayer.enabled = false;
    layersRef.current.overlay = overlayLayer;
    wwd.addLayer(overlayLayer);

    // Add view controls layer (on-screen navigation controls)
    wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

    // Set optimal camera position for dramatic view
    wwd.navigator.range = 15000000; // Closer view
    wwd.navigator.tilt = 65; // More dramatic tilt
    wwd.navigator.heading = 0;

    // Center on CONUS with slight offset for visual appeal
    wwd.navigator.lookAtLocation.latitude = 38;
    wwd.navigator.lookAtLocation.longitude = -97;

    // Enable depth testing for proper layer rendering
    wwd.depthBits = 24;

    wwd.redraw();

    return () => {
      // Stop animation loop on cleanup
      if (animationControllerRef.current) {
        animationControllerRef.current.stop();
      }
      wwRef.current = null;
      layersRef.current = {};
      animationControllerRef.current = null;
      animatedEventsRef.current = [];
    };
  }, []);

  // Update layer visibility when layerStates changes
  useEffect(() => {
    const wwd = wwRef.current;
    const layers = layersRef.current;

    if (!wwd || !layers) {
      return;
    }

    // Update each layer's enabled state
    Object.keys(layerStates).forEach((layerId) => {
      if (layers[layerId]) {
        layers[layerId].enabled = layerStates[layerId];
      }
    });

    wwd.redraw();
  }, [layerStates]);

  // Handle mouse move for coordinate display
  const handleMouseMove = useCallback((event) => {
    const wwd = wwRef.current;
    if (!wwd) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Pick terrain at mouse position
    const pickList = wwd.pick(wwd.canvasCoordinates(x, y));
    const terrainObject = pickList.terrainObject();

    if (terrainObject) {
      const pos = terrainObject.position;
      setCoords({
        lat: pos.latitude,
        lon: pos.longitude,
        elev: pos.altitude
      });
    } else {
      setCoords(null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setCoords(null);
  }, []);

  // Format coordinate for display
  const formatCoord = (value, isLat) => {
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const min = ((abs - deg) * 60).toFixed(1);
    const dir = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
    return `${deg}°${min}'${dir}`;
  };

  const formatElev = (meters) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="globe-canvas"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        Your browser does not support HTML5 Canvas.
      </canvas>
      {coords && (
        <div className="coords-display">
          <span>{formatCoord(coords.lat, true)}</span>
          <span>{formatCoord(coords.lon, false)}</span>
          <span>Elev {formatElev(coords.elev)}</span>
        </div>
      )}
    </>
  );
}

export default Globe;
