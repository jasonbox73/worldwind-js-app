import WorldWind from 'worldwindjs';

/**
 * Creates space-based sensor and orbital path visualization
 * Includes:
 * - Multiple orbital trajectories
 * - Sensor satellite nodes
 * - Detection coverage indicators
 */
export function createSensorLayer() {
  const layer = new WorldWind.RenderableLayer('Sensor Network');

  // Define orbital paths (simplified for visualization)
  const orbits = [
    {
      name: 'Polar Orbit 1',
      inclination: 97, // Near-polar
      altitude: 800000, // 800km
      color: new WorldWind.Color(0.4, 0.8, 1.0, 0.7),
      sensorCount: 4
    },
    {
      name: 'Polar Orbit 2',
      inclination: 82,
      altitude: 1200000, // 1200km
      color: new WorldWind.Color(0.5, 0.9, 1.0, 0.6),
      sensorCount: 3
    },
    {
      name: 'MEO Orbit',
      inclination: 55,
      altitude: 2000000, // 2000km
      color: new WorldWind.Color(0.6, 1.0, 1.0, 0.5),
      sensorCount: 3
    }
  ];

  // Create orbital paths and sensors
  orbits.forEach((orbit, index) => {
    const { path, sensorPositions } = createOrbitalPath(orbit, index * 45);

    // Add orbital path
    path.forEach(p => layer.addRenderable(p));

    // Add sensor nodes
    sensorPositions.forEach(pos => {
      const sensors = createSensorNode(pos, orbit.color);
      sensors.forEach(s => layer.addRenderable(s));
    });
  });

  return layer;
}

/**
 * Create a complete orbital path around Earth
 */
function createOrbitalPath(orbit, phaseOffset) {
  const positions = [];
  const sensorPositions = [];
  const segments = 120;
  const { inclination, altitude, color, sensorCount } = orbit;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * 360;

    // Calculate position along orbital path
    const lat = Math.sin((angle + phaseOffset) * Math.PI / 180) * inclination;
    const lon = ((angle + phaseOffset) % 360) - 180;

    positions.push(new WorldWind.Position(lat, lon, altitude));

    // Mark sensor positions at regular intervals
    if (i % Math.floor(segments / sensorCount) === 0 && i > 0 && i < segments) {
      sensorPositions.push(new WorldWind.Position(lat, lon, altitude));
    }
  }

  const path = addGlowingPath(positions, color, 1.2, 3);

  return { path, sensorPositions };
}

/**
 * Create sensor node with detection coverage visualization
 */
function createSensorNode(position, color) {
  const shapes = [];

  // Large outer glow
  const outerGlow = new WorldWind.PlacemarkAttributes(null);
  outerGlow.imageSource = createGlowCanvas(160,
    `rgba(${color.red * 255}, ${color.green * 255}, ${color.blue * 255}, 1)`,
    `rgba(${color.red * 255}, ${color.green * 255}, ${color.blue * 255}, 0)`
  );
  outerGlow.imageScale = 0.5;
  outerGlow.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 0.5
  );

  const outerMark = new WorldWind.Placemark(position, false, outerGlow);
  outerMark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
  shapes.push(outerMark);

  // Bright center core
  const centerGlow = new WorldWind.PlacemarkAttributes(null);
  centerGlow.imageSource = createGlowCanvas(64,
    'rgba(255, 255, 255, 1)',
    `rgba(${color.red * 255}, ${color.green * 255}, ${color.blue * 255}, 0)`
  );
  centerGlow.imageScale = 0.2;
  centerGlow.imageOffset = new WorldWind.Offset(
    WorldWind.OFFSET_FRACTION, 0.5,
    WorldWind.OFFSET_FRACTION, 0.5
  );

  const centerMark = new WorldWind.Placemark(position, false, centerGlow);
  centerMark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
  shapes.push(centerMark);

  // Detection cone (simplified as expanding circle)
  const detectionRadius = 15; // degrees
  const conePositions = [];
  const segments = 40;

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 360;
    const bearing = angle * (Math.PI / 180);
    const angularDist = (detectionRadius * Math.PI) / 180;

    const lat = Math.asin(
      Math.sin(position.latitude * Math.PI / 180) * Math.cos(angularDist) +
      Math.cos(position.latitude * Math.PI / 180) * Math.sin(angularDist) * Math.cos(bearing)
    ) * (180 / Math.PI);

    const lon = position.longitude + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(position.latitude * Math.PI / 180),
      Math.cos(angularDist) - Math.sin(position.latitude * Math.PI / 180) * Math.sin(lat * Math.PI / 180)
    ) * (180 / Math.PI);

    conePositions.push(new WorldWind.Position(lat, lon, position.altitude * 0.3));
  }

  // Create detection cone as path
  const coneColor = new WorldWind.Color(color.red, color.green, color.blue, 0.3);
  const conePaths = addGlowingPath(conePositions, coneColor, 0.8, 2);
  shapes.push(...conePaths);

  return shapes;
}

/**
 * Helper: Create path with glow effect
 */
function addGlowingPath(positions, color, baseWidth, glowLayers) {
  const paths = [];

  for (let i = glowLayers; i >= 0; i--) {
    const attrs = new WorldWind.ShapeAttributes(null);
    const alpha = i === 0 ? color.alpha : color.alpha * (0.15 / i);
    const width = i === 0 ? baseWidth : baseWidth + (i * 2.5);

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
