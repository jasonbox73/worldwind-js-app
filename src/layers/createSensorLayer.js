import WorldWind from 'worldwindjs';

/**
 * Creates threat detection event visualization
 * Shows static detection markers over CONUS
 * (Orbital paths and satellites are handled by AnimatedSatellites layer)
 */
export function createSensorLayer() {
  const layer = new WorldWind.RenderableLayer('Sensor Network');

  // Add detection events (threat tracking indicators over CONUS)
  const detectionEvents = createDetectionEvents();
  detectionEvents.forEach(event => layer.addRenderable(event));

  return layer;
}

/**
 * Create detection events - visual indicators of active threat tracking
 * Shows pulsing markers over potential threat launch areas
 */
function createDetectionEvents() {
  const events = [];

  // Simulate detection events at strategic locations over CONUS
  const detectionLocations = [
    { lat: 45, lon: -110, label: 'Track-01' },  // Northern corridor
    { lat: 35, lon: -95, label: 'Track-02' },   // Central CONUS
    { lat: 40, lon: -85, label: 'Track-03' }    // Eastern corridor
  ];

  detectionLocations.forEach((loc, index) => {
    // Create pulsing detection marker
    const detectionColor = new WorldWind.Color(1.0, 0.3, 0.3, 0.8); // Red/orange

    // Multiple pulse rings for visual effect
    for (let pulseLayer = 0; pulseLayer < 3; pulseLayer++) {
      const pulseRadius = 3 + (pulseLayer * 2); // Expanding rings
      const pulsePositions = [];
      const segments = 30;

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 360;
        const bearing = angle * (Math.PI / 180);
        const angularDist = (pulseRadius * Math.PI) / 180;

        const lat = Math.asin(
          Math.sin(loc.lat * Math.PI / 180) * Math.cos(angularDist) +
          Math.cos(loc.lat * Math.PI / 180) * Math.sin(angularDist) * Math.cos(bearing)
        ) * (180 / Math.PI);

        const lon = loc.lon + Math.atan2(
          Math.sin(bearing) * Math.sin(angularDist) * Math.cos(loc.lat * Math.PI / 180),
          Math.cos(angularDist) - Math.sin(loc.lat * Math.PI / 180) * Math.sin(lat * Math.PI / 180)
        ) * (180 / Math.PI);

        pulsePositions.push(new WorldWind.Position(lat, lon, 200000)); // 200km altitude
      }

      // Create pulse ring
      const attrs = new WorldWind.ShapeAttributes(null);
      attrs.outlineColor = new WorldWind.Color(
        detectionColor.red,
        detectionColor.green,
        detectionColor.blue,
        detectionColor.alpha * (0.6 - pulseLayer * 0.15)
      );
      attrs.outlineWidth = 2.5 - (pulseLayer * 0.5);
      attrs.drawInterior = false;
      attrs.applyLighting = false;

      const pulsePath = new WorldWind.Path(pulsePositions, attrs);
      pulsePath.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
      pulsePath.followTerrain = false;
      pulsePath.extrude = false;

      events.push(pulsePath);
    }

    // Central detection indicator
    const centerAttrs = new WorldWind.PlacemarkAttributes(null);
    centerAttrs.imageSource = createGlowCanvas(96,
      'rgba(255, 80, 80, 1)',
      'rgba(255, 80, 80, 0)'
    );
    centerAttrs.imageScale = 0.4;
    centerAttrs.imageOffset = new WorldWind.Offset(
      WorldWind.OFFSET_FRACTION, 0.5,
      WorldWind.OFFSET_FRACTION, 0.5
    );

    const centerMark = new WorldWind.Placemark(
      new WorldWind.Position(loc.lat, loc.lon, 200000),
      false,
      centerAttrs
    );
    centerMark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    centerMark.label = loc.label;
    events.push(centerMark);
  });

  return events;
}

/**
 * Create canvas with radial gradient glow
 */
function createGlowCanvas(size, centerColor, edgeColor) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, centerColor);
  gradient.addColorStop(0.3, centerColor.replace(/[\d.]+\)$/, '0.6)'));
  gradient.addColorStop(0.7, edgeColor.replace(/[\d.]+\)$/, '0.2)'));
  gradient.addColorStop(1, edgeColor);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return canvas;
}

export default createSensorLayer;
