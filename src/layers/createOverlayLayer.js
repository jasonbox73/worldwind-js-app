import WorldWind from 'worldwindjs';

/**
 * Creates a custom overlay layer with:
 * 1. Coordinate grid (graticule)
 * 2. US boundary outline
 * 3. Orbital trajectory paths
 * 4. Glowing point markers
 */
export function createOverlayLayer() {
  const overlayLayer = new WorldWind.RenderableLayer('Overlay');

  // Add all overlay elements
  addGraticule(overlayLayer);
  addUSBoundary(overlayLayer);
  addOrbitalPaths(overlayLayer);
  addPointMarkers(overlayLayer);

  return overlayLayer;
}

/**
 * 1. GRATICULE - Latitude/Longitude grid lines
 */
function addGraticule(layer) {
  const gridColor = new WorldWind.Color(0.4, 0.6, 0.9, 0.6); // Light blue, semi-transparent

  const pathAttributes = new WorldWind.ShapeAttributes(null);
  pathAttributes.outlineColor = gridColor;
  pathAttributes.outlineWidth = 1;
  pathAttributes.drawInterior = false;

  // Latitude lines (every 15 degrees)
  for (let lat = -75; lat <= 75; lat += 15) {
    const positions = [];
    for (let lon = -180; lon <= 180; lon += 5) {
      positions.push(new WorldWind.Position(lat, lon, 10000)); // Slight altitude above surface
    }
    const path = new WorldWind.Path(positions, pathAttributes);
    path.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    path.followTerrain = true;
    layer.addRenderable(path);
  }

  // Longitude lines (every 15 degrees)
  for (let lon = -180; lon < 180; lon += 15) {
    const positions = [];
    for (let lat = -90; lat <= 90; lat += 5) {
      positions.push(new WorldWind.Position(lat, lon, 10000));
    }
    const path = new WorldWind.Path(positions, pathAttributes);
    path.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    path.followTerrain = true;
    layer.addRenderable(path);
  }
}

/**
 * 2. US BOUNDARY - Simplified outline of continental United States
 */
function addUSBoundary(layer) {
  const boundaryColor = new WorldWind.Color(0.9, 0.7, 0.2, 0.9); // Gold/yellow

  const pathAttributes = new WorldWind.ShapeAttributes(null);
  pathAttributes.outlineColor = boundaryColor;
  pathAttributes.outlineWidth = 2;
  pathAttributes.drawInterior = false;

  // Simplified US continental boundary coordinates
  const usBoundary = [
    [47.0, -124.5], [48.5, -124.5], [49.0, -123.0], [49.0, -117.0],
    [49.0, -110.0], [49.0, -104.0], [49.0, -97.0], [49.0, -95.0],
    [48.0, -89.0], [46.5, -84.5], [45.5, -82.5], [43.5, -82.5],
    [42.0, -83.0], [41.5, -82.5], [42.0, -79.0], [43.0, -79.0],
    [43.5, -76.5], [45.0, -75.0], [45.0, -71.0], [47.5, -69.0],
    [47.0, -68.0], [44.5, -67.0], [43.0, -70.0], [41.5, -70.0],
    [41.0, -72.0], [41.0, -74.0], [39.5, -74.5], [38.5, -75.0],
    [37.0, -76.0], [35.5, -75.5], [35.0, -77.0], [34.0, -78.0],
    [33.0, -79.0], [32.0, -80.5], [30.5, -81.5], [25.0, -80.0],
    [24.5, -81.5], [25.0, -82.0], [27.0, -83.0], [29.0, -83.5],
    [29.5, -85.0], [30.0, -88.0], [30.0, -89.5], [29.0, -89.5],
    [29.5, -94.0], [26.0, -97.0], [26.0, -97.5], [28.0, -97.0],
    [29.5, -95.0], [29.5, -94.5], [30.0, -94.0], [32.0, -94.5],
    [33.5, -94.0], [36.5, -94.5], [37.0, -102.0], [37.0, -109.0],
    [31.5, -111.0], [32.5, -114.5], [33.0, -117.0], [34.5, -120.5],
    [36.0, -122.0], [38.0, -123.0], [40.5, -124.5], [42.0, -124.5],
    [46.0, -124.0], [47.0, -124.5]
  ];

  const positions = usBoundary.map(([lat, lon]) =>
    new WorldWind.Position(lat, lon, 15000)
  );

  const path = new WorldWind.Path(positions, pathAttributes);
  path.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
  layer.addRenderable(path);
}

/**
 * 3. ORBITAL PATHS - Curved trajectory lines resembling satellite orbits
 */
function addOrbitalPaths(layer) {
  const orbitColor = new WorldWind.Color(0.9, 0.2, 0.3, 0.8); // Red

  const pathAttributes = new WorldWind.ShapeAttributes(null);
  pathAttributes.outlineColor = orbitColor;
  pathAttributes.outlineWidth = 2;
  pathAttributes.drawInterior = false;

  // Orbital path 1 - curves across Pacific to North America
  const orbit1 = generateOrbitalPath(15, -160, 55, -100, 800000, 40);
  const path1 = new WorldWind.Path(orbit1, pathAttributes);
  path1.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
  layer.addRenderable(path1);

  // Orbital path 2 - second trajectory
  const orbit2 = generateOrbitalPath(5, -170, 45, -110, 600000, 35);
  const path2 = new WorldWind.Path(orbit2, pathAttributes);
  path2.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
  layer.addRenderable(path2);

  // Orbital path 3 - crossing path
  const orbit3 = generateOrbitalPath(35, -150, 25, -80, 500000, 30);
  const path3 = new WorldWind.Path(orbit3, pathAttributes);
  path3.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
  layer.addRenderable(path3);
}

/**
 * Generate positions for an orbital-looking curved path
 */
function generateOrbitalPath(startLat, startLon, endLat, endLon, maxAlt, segments) {
  const positions = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // Interpolate lat/lon
    const lat = startLat + (endLat - startLat) * t;
    const lon = startLon + (endLon - startLon) * t;
    // Arc altitude: peaks in the middle (sine curve)
    const alt = maxAlt * Math.sin(Math.PI * t);
    positions.push(new WorldWind.Position(lat, lon, alt));
  }

  return positions;
}

/**
 * 4. POINT MARKERS - Glowing dots along orbital paths
 */
function addPointMarkers(layer) {
  // Marker positions along the orbital paths
  const markerPositions = [
    { lat: 20, lon: -155, alt: 400000 },
    { lat: 30, lon: -145, alt: 650000 },
    { lat: 40, lon: -130, alt: 750000 },
    { lat: 50, lon: -115, alt: 600000 },
    { lat: 15, lon: -160, alt: 350000 },
    { lat: 25, lon: -140, alt: 500000 },
    { lat: 35, lon: -120, alt: 450000 },
  ];

  // Create placemark attributes for glowing effect
  const placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
  placemarkAttributes.imageSource = createGlowingDotCanvas();
  placemarkAttributes.imageScale = 0.15;
  placemarkAttributes.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 0.5
  );

  markerPositions.forEach(({ lat, lon, alt }) => {
    const position = new WorldWind.Position(lat, lon, alt);
    const placemark = new WorldWind.Placemark(position, false, placemarkAttributes);
    placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    layer.addRenderable(placemark);
  });
}

/**
 * Create a canvas with a glowing dot effect for markers
 */
function createGlowingDotCanvas() {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Create radial gradient for glow effect
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, 'rgba(255, 200, 100, 1)');    // Bright center
  gradient.addColorStop(0.2, 'rgba(255, 150, 50, 0.9)'); // Orange
  gradient.addColorStop(0.5, 'rgba(255, 100, 50, 0.4)'); // Fade
  gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');       // Transparent edge

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return canvas;
}

export default createOverlayLayer;
