import WorldWind from 'worldwindjs';

/**
 * Creates space-based sensor and orbital path visualization
 * Includes:
 * - Multiple orbital trajectories
 * - Sensor satellite nodes
 * - Detection coverage indicators
 * - Detection event visualization
 * - Sensor-to-sensor handoff links
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

  // Store all sensor positions for handoff links
  const allSensorPositions = [];

  // Create orbital paths and sensors
  orbits.forEach((orbit, index) => {
    const { path, sensorPositions } = createOrbitalPath(orbit, index * 45);

    // Add orbital path
    path.forEach(p => layer.addRenderable(p));

    // Add sensor nodes with detection indicators
    sensorPositions.forEach((pos, sensorIndex) => {
      const sensors = createSensorNode(pos, orbit.color, orbit.name, sensorIndex);
      sensors.forEach(s => layer.addRenderable(s));

      // Store position for handoff links
      allSensorPositions.push({ position: pos, color: orbit.color, orbitName: orbit.name });
    });
  });

  // Add detection events (threat tracking indicators over CONUS)
  const detectionEvents = createDetectionEvents();
  detectionEvents.forEach(event => layer.addRenderable(event));

  // Add sensor-to-sensor handoff links (connecting sensors with overlapping coverage)
  const handoffLinks = createHandoffLinks(allSensorPositions);
  handoffLinks.forEach(link => layer.addRenderable(link));

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
 * Create sensor-to-sensor handoff links
 * Visual representation of tracking continuity between satellites
 */
function createHandoffLinks(sensorPositions) {
  const links = [];
  const linkColor = new WorldWind.Color(0.5, 1.0, 0.8, 0.3); // Cyan-green

  // Create links between sensors with overlapping coverage areas
  // Connect sensors from different orbits that have line-of-sight
  for (let i = 0; i < sensorPositions.length; i++) {
    for (let j = i + 1; j < sensorPositions.length; j++) {
      const sensor1 = sensorPositions[i];
      const sensor2 = sensorPositions[j];

      // Only link sensors from different orbits
      if (sensor1.orbitName !== sensor2.orbitName) {
        // Calculate angular distance between sensors
        const distance = calculateAngularDistance(
          sensor1.position.latitude, sensor1.position.longitude,
          sensor2.position.latitude, sensor2.position.longitude
        );

        // Only create link if sensors are relatively close (within 60 degrees)
        if (distance < 60) {
          const linkPositions = [
            sensor1.position,
            sensor2.position
          ];

          // Create semi-transparent dashed link
          const attrs = new WorldWind.ShapeAttributes(null);
          attrs.outlineColor = linkColor;
          attrs.outlineWidth = 1.5;
          attrs.drawInterior = false;
          attrs.applyLighting = false;
          attrs.outlineStippleFactor = 128;
          attrs.outlineStipplePattern = 0x00FF; // Dashed pattern

          const linkPath = new WorldWind.Path(linkPositions, attrs);
          linkPath.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
          linkPath.followTerrain = false;
          linkPath.extrude = false;

          links.push(linkPath);
        }
      }
    }
  }

  return links;
}

/**
 * Calculate angular distance between two lat/lon points
 */
function calculateAngularDistance(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return c * 180 / Math.PI; // Return degrees
}

/**
 * Create sensor node with detection coverage visualization
 */
function createSensorNode(position, color, orbitName, sensorIndex) {
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
