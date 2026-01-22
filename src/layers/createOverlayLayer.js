import WorldWind from 'worldwindjs';

/**
 * Creates a custom overlay layer with glowing effects:
 * 1. Dense coordinate grid with glow
 * 2. US boundary outline with glow
 * 3. Orbital trajectory paths with glow
 * 4. Glowing point markers
 */
export function createOverlayLayer() {
  const overlayLayer = new WorldWind.RenderableLayer('Overlay');

  addGraticule(overlayLayer);
  addUSBoundary(overlayLayer);
  addOrbitalPaths(overlayLayer);
  addPointMarkers(overlayLayer);

  return overlayLayer;
}

/**
 * Helper: Create path with glow effect by layering multiple paths
 */
function addGlowingPath(layer, positions, color, baseWidth, glowLayers = 3) {
  // Draw glow layers from outer (wide, transparent) to inner (narrow, opaque)
  for (let i = glowLayers; i >= 0; i--) {
    const attrs = new WorldWind.ShapeAttributes(null);
    const alpha = i === 0 ? color.alpha : color.alpha * (0.15 / i);
    const width = i === 0 ? baseWidth : baseWidth + (i * 3);

    attrs.outlineColor = new WorldWind.Color(color.red, color.green, color.blue, alpha);
    attrs.outlineWidth = width;
    attrs.drawInterior = false;

    const path = new WorldWind.Path(positions, attrs);
    path.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    path.followTerrain = false;
    path.extrude = false;
    layer.addRenderable(path);
  }
}

/**
 * 1. GRATICULE - Dense latitude/longitude grid with glow
 */
function addGraticule(layer) {
  const gridColor = new WorldWind.Color(0.5, 0.7, 1.0, 0.7); // Light blue
  const gridSpacing = 10; // Degrees between lines
  const altitude = 5000; // Slight altitude above surface

  // Latitude lines
  for (let lat = -80; lat <= 80; lat += gridSpacing) {
    const positions = [];
    for (let lon = -180; lon <= 180; lon += 2) {
      positions.push(new WorldWind.Position(lat, lon, altitude));
    }
    addGlowingPath(layer, positions, gridColor, 0.5, 2);
  }

  // Longitude lines
  for (let lon = -180; lon < 180; lon += gridSpacing) {
    const positions = [];
    for (let lat = -90; lat <= 90; lat += 2) {
      positions.push(new WorldWind.Position(lat, lon, altitude));
    }
    addGlowingPath(layer, positions, gridColor, 0.5, 2);
  }
}

/**
 * 2. US BOUNDARY - Detailed outline with glow effect
 */
function addUSBoundary(layer) {
  const boundaryColor = new WorldWind.Color(1.0, 0.8, 0.2, 0.9); // Gold/yellow

  // More detailed US continental boundary
  const usBoundary = [
    // Pacific Northwest
    [48.3, -124.7], [48.5, -124.0], [48.5, -123.0], [49.0, -123.0],
    [49.0, -117.0], [49.0, -111.0], [49.0, -104.5], [49.0, -100.0],
    [49.0, -97.2], [49.4, -95.2], [49.0, -95.0],
    // Great Lakes / Northeast
    [48.0, -89.5], [47.5, -85.0], [46.5, -84.5], [46.0, -83.5],
    [45.0, -82.5], [43.5, -82.5], [42.5, -82.5], [42.0, -83.0],
    [41.7, -83.0], [41.5, -82.7], [42.0, -81.0], [42.0, -79.8],
    [42.5, -79.0], [43.2, -79.0], [43.5, -79.0], [44.0, -76.5],
    [44.5, -75.5], [45.0, -74.7], [45.0, -73.5], [45.0, -71.5],
    [45.3, -71.0], [47.5, -69.2], [47.4, -68.3], [47.0, -67.8],
    // East Coast
    [45.0, -67.0], [44.5, -67.5], [44.0, -68.5], [43.5, -70.0],
    [42.0, -70.5], [41.5, -70.0], [41.3, -71.8], [41.0, -72.0],
    [40.6, -73.5], [40.5, -74.0], [39.5, -74.2], [39.0, -74.9],
    [38.5, -75.0], [38.0, -75.5], [37.0, -76.0], [36.5, -76.0],
    [36.0, -75.8], [35.2, -75.5], [35.0, -76.5], [34.5, -77.5],
    [34.0, -78.0], [33.5, -79.0], [32.5, -80.0], [32.0, -80.8],
    [31.0, -81.3], [30.5, -81.5], [30.0, -81.3], [29.5, -81.0],
    // Florida
    [28.5, -80.5], [27.5, -80.2], [26.5, -80.0], [25.5, -80.2],
    [25.0, -80.5], [24.5, -81.8], [24.6, -82.8], [25.0, -81.2],
    [26.5, -82.0], [27.5, -82.5], [28.0, -82.8], [29.0, -83.0],
    [29.5, -83.5], [29.8, -84.5], [30.0, -85.5], [30.2, -86.5],
    [30.2, -87.5], [30.3, -88.0], [30.2, -89.0],
    // Gulf Coast
    [29.5, -89.5], [29.2, -90.0], [29.0, -90.5], [29.2, -91.0],
    [29.5, -92.0], [29.5, -93.5], [29.7, -94.5], [29.3, -95.0],
    [28.8, -95.5], [28.0, -96.5], [27.5, -97.0], [26.5, -97.2],
    [26.0, -97.3], [25.9, -97.5],
    // Texas-Mexico border / Southwest
    [26.5, -99.0], [27.5, -99.5], [29.5, -101.0], [29.5, -102.0],
    [29.8, -102.5], [30.5, -103.0], [31.0, -103.5], [31.8, -106.5],
    [32.0, -107.0], [31.5, -108.2], [31.3, -111.0],
    // Arizona / California
    [32.5, -114.8], [32.7, -115.5], [33.0, -117.0], [33.5, -118.0],
    [34.0, -119.0], [34.5, -120.5], [35.5, -121.0], [36.5, -122.0],
    [37.5, -122.5], [38.0, -123.0], [39.0, -123.5], [40.0, -124.0],
    [41.0, -124.2], [42.0, -124.5], [43.0, -124.5], [46.0, -124.0],
    [47.0, -124.5], [48.3, -124.7]
  ];

  const positions = usBoundary.map(([lat, lon]) =>
    new WorldWind.Position(lat, lon, 20000)
  );

  addGlowingPath(layer, positions, boundaryColor, 1.5, 4);
}

/**
 * 3. ORBITAL PATHS - Curved trajectories with glow
 */
function addOrbitalPaths(layer) {
  const orbitColor = new WorldWind.Color(0.9, 0.15, 0.2, 0.85); // Red

  // Path 1 - High arc from Pacific to North America
  const orbit1 = generateOrbitalPath(10, -175, 60, -90, 1200000, 80);
  addGlowingPath(layer, orbit1, orbitColor, 1.5, 4);

  // Path 2 - Medium arc
  const orbit2 = generateOrbitalPath(0, -165, 50, -100, 900000, 70);
  addGlowingPath(layer, orbit2, orbitColor, 1.5, 4);

  // Path 3 - Lower crossing arc
  const orbit3 = generateOrbitalPath(20, -155, 35, -70, 600000, 60);
  addGlowingPath(layer, orbit3, orbitColor, 1.5, 4);
}

/**
 * Generate smooth orbital arc positions
 */
function generateOrbitalPath(startLat, startLon, endLat, endLon, maxAlt, segments) {
  const positions = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    // Use smooth interpolation for more natural curve
    const smoothT = t * t * (3 - 2 * t); // Smoothstep

    const lat = startLat + (endLat - startLat) * smoothT;
    const lon = startLon + (endLon - startLon) * t;

    // Parabolic altitude profile
    const alt = maxAlt * Math.sin(Math.PI * t);

    positions.push(new WorldWind.Position(lat, lon, alt));
  }

  return positions;
}

/**
 * 4. POINT MARKERS - Bright glowing markers along paths
 */
function addPointMarkers(layer) {
  const markerPositions = [
    // Along orbital path 1
    { lat: 15, lon: -170, alt: 300000 },
    { lat: 25, lon: -160, alt: 700000 },
    { lat: 40, lon: -140, alt: 1100000 },
    { lat: 55, lon: -110, alt: 900000 },
    // Along orbital path 2
    { lat: 10, lon: -160, alt: 400000 },
    { lat: 30, lon: -140, alt: 800000 },
    { lat: 45, lon: -115, alt: 700000 },
    // Along orbital path 3
    { lat: 22, lon: -150, alt: 200000 },
    { lat: 28, lon: -120, alt: 500000 },
    { lat: 32, lon: -90, alt: 350000 },
  ];

  // Create large glow marker
  const largeGlow = new WorldWind.PlacemarkAttributes(null);
  largeGlow.imageSource = createGlowCanvas(128, 'rgba(255, 180, 80, 1)', 'rgba(255, 100, 30, 0)');
  largeGlow.imageScale = 0.4;
  largeGlow.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 0.5
  );

  // Create bright center marker
  const brightCenter = new WorldWind.PlacemarkAttributes(null);
  brightCenter.imageSource = createGlowCanvas(64, 'rgba(255, 255, 220, 1)', 'rgba(255, 200, 100, 0)');
  brightCenter.imageScale = 0.15;
  brightCenter.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 0.5
  );

  markerPositions.forEach(({ lat, lon, alt }) => {
    const position = new WorldWind.Position(lat, lon, alt);

    // Outer glow
    const glowMark = new WorldWind.Placemark(position, false, largeGlow);
    glowMark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    layer.addRenderable(glowMark);

    // Bright center
    const centerMark = new WorldWind.Placemark(position, false, brightCenter);
    centerMark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    layer.addRenderable(centerMark);
  });
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
  gradient.addColorStop(0.3, centerColor.replace('1)', '0.6)'));
  gradient.addColorStop(0.6, edgeColor.replace('0)', '0.2)'));
  gradient.addColorStop(1, edgeColor);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return canvas;
}

export default createOverlayLayer;
