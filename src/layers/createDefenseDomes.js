import WorldWind from 'worldwindjs';

/**
 * Creates layered defense dome visualization system
 * Three semi-transparent hemispheres representing different defense layers:
 * - Terminal (endo-atmospheric)
 * - Midcourse (exo-atmospheric)
 * - Space-based detection
 */
export function createDefenseDomes() {
  const layers = {
    terminal: createTerminalLayer(),
    midcourse: createMidcourseLayer(),
    spaceBased: createSpaceBasedLayer()
  };

  return layers;
}

/**
 * Terminal Defense Layer (endo-atmospheric)
 * Altitude: 50-150km, Color: Gold/Amber
 */
function createTerminalLayer() {
  const layer = new WorldWind.RenderableLayer('Terminal Defense');

  const centerLat = 39.8; // Center of CONUS
  const centerLon = -98.5;
  const radiusKm = 2200; // Coverage radius
  const altitudeKm = 100; // Dome peak altitude

  const dome = createHemisphericalDome(
    centerLat,
    centerLon,
    radiusKm,
    altitudeKm,
    new WorldWind.Color(1.0, 0.75, 0.2, 0.15), // Gold
    new WorldWind.Color(1.0, 0.85, 0.3, 0.6)   // Gold edge glow
  );

  dome.forEach(shape => layer.addRenderable(shape));

  return layer;
}

/**
 * Midcourse Defense Layer (exo-atmospheric)
 * Altitude: 150-1000km, Color: Blue/Cyan
 */
function createMidcourseLayer() {
  const layer = new WorldWind.RenderableLayer('Midcourse Defense');

  const centerLat = 39.8;
  const centerLon = -98.5;
  const radiusKm = 2800;
  const altitudeKm = 500;

  const dome = createHemisphericalDome(
    centerLat,
    centerLon,
    radiusKm,
    altitudeKm,
    new WorldWind.Color(0.2, 0.5, 1.0, 0.12), // Blue
    new WorldWind.Color(0.3, 0.6, 1.0, 0.5)   // Blue edge glow
  );

  dome.forEach(shape => layer.addRenderable(shape));

  return layer;
}

/**
 * Space-Based Detection Layer
 * Altitude: 1000-2000km, Color: Cyan/White
 */
function createSpaceBasedLayer() {
  const layer = new WorldWind.RenderableLayer('Space-Based Detection');

  const centerLat = 39.8;
  const centerLon = -98.5;
  const radiusKm = 3500;
  const altitudeKm = 1500;

  const dome = createHemisphericalDome(
    centerLat,
    centerLon,
    radiusKm,
    altitudeKm,
    new WorldWind.Color(0.4, 0.9, 1.0, 0.08), // Cyan
    new WorldWind.Color(0.5, 0.95, 1.0, 0.4)  // Cyan edge glow
  );

  dome.forEach(shape => layer.addRenderable(shape));

  return layer;
}

/**
 * Create a hemispherical dome using multiple arc paths
 * Returns array of Path objects forming a dome
 */
function createHemisphericalDome(centerLat, centerLon, radiusKm, altitudeKm, fillColor, edgeColor) {
  const shapes = [];
  const earthRadiusKm = 6371; // Earth's radius

  // Calculate angular radius in degrees
  const angularRadius = (radiusKm / earthRadiusKm) * (180 / Math.PI);

  // Create meridian arcs (longitude lines from base to apex)
  const numMeridians = 24;
  for (let i = 0; i < numMeridians; i++) {
    const angle = (i / numMeridians) * 360;
    const meridian = createMeridianArc(centerLat, centerLon, angularRadius, angle, altitudeKm, edgeColor);
    shapes.push(...meridian);
  }

  // Create parallel arcs (latitude circles at various heights)
  const numParallels = 8;
  for (let i = 1; i <= numParallels; i++) {
    const t = i / (numParallels + 1);
    const heightFactor = Math.sin(t * Math.PI / 2); // More rings near base
    const parallel = createParallelArc(centerLat, centerLon, angularRadius, t, altitudeKm * heightFactor, edgeColor);
    shapes.push(...parallel);
  }

  // Add surface coverage circle at base with fill
  const baseCircle = createBaseCircle(centerLat, centerLon, angularRadius, fillColor);
  shapes.push(baseCircle);

  return shapes;
}

/**
 * Create meridian arc (vertical line from base to apex)
 */
function createMeridianArc(centerLat, centerLon, radius, azimuth, maxAlt, color) {
  const positions = [];
  const segments = 30;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const currentRadius = radius * Math.cos(t * Math.PI / 2);
    const altitude = maxAlt * 1000 * Math.sin(t * Math.PI / 2); // Convert to meters

    const bearing = azimuth * (Math.PI / 180);
    const angularDist = (currentRadius * Math.PI) / 180;

    const lat = Math.asin(
      Math.sin(centerLat * Math.PI / 180) * Math.cos(angularDist) +
      Math.cos(centerLat * Math.PI / 180) * Math.sin(angularDist) * Math.cos(bearing)
    ) * (180 / Math.PI);

    const lon = centerLon + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(centerLat * Math.PI / 180),
      Math.cos(angularDist) - Math.sin(centerLat * Math.PI / 180) * Math.sin(lat * Math.PI / 180)
    ) * (180 / Math.PI);

    positions.push(new WorldWind.Position(lat, lon, altitude));
  }

  return addGlowingPath(positions, color, 1.0, 2);
}

/**
 * Create parallel arc (horizontal circle at given height)
 */
function createParallelArc(centerLat, centerLon, maxRadius, heightFraction, altitude, color) {
  const positions = [];
  const segments = 60;
  const currentRadius = maxRadius * Math.cos(heightFraction * Math.PI / 2);

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 360;
    const bearing = angle * (Math.PI / 180);
    const angularDist = (currentRadius * Math.PI) / 180;

    const lat = Math.asin(
      Math.sin(centerLat * Math.PI / 180) * Math.cos(angularDist) +
      Math.cos(centerLat * Math.PI / 180) * Math.sin(angularDist) * Math.cos(bearing)
    ) * (180 / Math.PI);

    const lon = centerLon + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(centerLat * Math.PI / 180),
      Math.cos(angularDist) - Math.sin(centerLat * Math.PI / 180) * Math.sin(lat * Math.PI / 180)
    ) * (180 / Math.PI);

    positions.push(new WorldWind.Position(lat, lon, altitude * 1000));
  }

  return addGlowingPath(positions, color, 0.8, 2);
}

/**
 * Create base circle with semi-transparent fill
 */
function createBaseCircle(centerLat, centerLon, radius, fillColor) {
  const positions = [];
  const segments = 60;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 360;
    const bearing = angle * (Math.PI / 180);
    const angularDist = (radius * Math.PI) / 180;

    const lat = Math.asin(
      Math.sin(centerLat * Math.PI / 180) * Math.cos(angularDist) +
      Math.cos(centerLat * Math.PI / 180) * Math.sin(angularDist) * Math.cos(bearing)
    ) * (180 / Math.PI);

    const lon = centerLon + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(centerLat * Math.PI / 180),
      Math.cos(angularDist) - Math.sin(centerLat * Math.PI / 180) * Math.sin(lat * Math.PI / 180)
    ) * (180 / Math.PI);

    positions.push(new WorldWind.Position(lat, lon, 5000));
  }

  const attrs = new WorldWind.ShapeAttributes(null);
  attrs.drawInterior = true;
  attrs.drawOutline = false;
  attrs.interiorColor = fillColor;
  attrs.applyLighting = false;

  const polygon = new WorldWind.SurfacePolygon(positions, attrs);
  return polygon;
}

/**
 * Helper: Create path with glow effect
 */
function addGlowingPath(positions, color, baseWidth, glowLayers) {
  const paths = [];

  for (let i = glowLayers; i >= 0; i--) {
    const attrs = new WorldWind.ShapeAttributes(null);
    const alpha = i === 0 ? color.alpha : color.alpha * (0.2 / i);
    const width = i === 0 ? baseWidth : baseWidth + (i * 2);

    attrs.outlineColor = new WorldWind.Color(color.red, color.green, color.blue, alpha);
    attrs.outlineWidth = width;
    attrs.drawInterior = false;
    attrs.applyLighting = false;

    const path = new WorldWind.Path(positions, attrs);
    path.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    path.followTerrain = false;
    path.extrude = false;

    paths.push(path);
  }

  return paths;
}

export default createDefenseDomes;
