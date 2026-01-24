import WorldWind from 'worldwindjs';

/**
 * Animated Detection Event
 * Represents a pulsing threat detection marker
 */
export class AnimatedDetectionEvent {
  constructor(latitude, longitude, label, baseColor) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.label = label;
    this.baseColor = baseColor;
    this.altitude = 200000; // 200km

    // Animation parameters
    this.pulseSpeed = 1.5; // Cycles per second
    this.pulseOffset = Math.random() * Math.PI * 2; // Random start phase
    this.maxRadius = 5; // degrees
    this.minRadius = 2; // degrees

    // Create the visual elements
    this.renderables = [];
    this.createVisuals();
  }

  /**
   * Create the visual elements for this detection event
   */
  createVisuals() {
    // Create 3 pulsing rings
    this.rings = [];
    for (let i = 0; i < 3; i++) {
      const ring = {
        index: i,
        positions: [],
        path: null,
        phaseOffset: (i * Math.PI * 2) / 3 // Stagger the rings
      };

      // Create initial ring geometry
      this.updateRingGeometry(ring, 0);

      this.rings.push(ring);
      if (ring.path) {
        this.renderables.push(ring.path);
      }
    }

    // Create central marker
    const centerAttrs = new WorldWind.PlacemarkAttributes(null);
    centerAttrs.imageSource = this.createGlowCanvas(96,
      `rgba(${this.baseColor.red * 255}, ${this.baseColor.green * 255}, ${this.baseColor.blue * 255}, 1)`,
      `rgba(${this.baseColor.red * 255}, ${this.baseColor.green * 255}, ${this.baseColor.blue * 255}, 0)`
    );
    centerAttrs.imageScale = 0.4;
    centerAttrs.imageOffset = new WorldWind.Offset(
      WorldWind.OFFSET_FRACTION, 0.5,
      WorldWind.OFFSET_FRACTION, 0.5
    );

    this.centerMarker = new WorldWind.Placemark(
      new WorldWind.Position(this.latitude, this.longitude, this.altitude),
      false,
      centerAttrs
    );
    this.centerMarker.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    this.centerMarker.label = this.label;
    this.renderables.push(this.centerMarker);
  }

  /**
   * Update ring geometry based on animation time
   */
  updateRingGeometry(ring, time) {
    const phase = time * this.pulseSpeed * Math.PI * 2 + this.pulseOffset + ring.phaseOffset;
    const pulse = Math.sin(phase);

    // Calculate current radius (oscillates between min and max)
    const radius = this.minRadius + ((pulse + 1) / 2) * (this.maxRadius - this.minRadius);

    // Calculate opacity (fades as it expands)
    const opacity = 0.8 - ((pulse + 1) / 2) * 0.6;

    // Generate circle positions
    const positions = [];
    const segments = 30;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 360;
      const bearing = angle * (Math.PI / 180);
      const angularDist = (radius * Math.PI) / 180;

      const lat = Math.asin(
        Math.sin(this.latitude * Math.PI / 180) * Math.cos(angularDist) +
        Math.cos(this.latitude * Math.PI / 180) * Math.sin(angularDist) * Math.cos(bearing)
      ) * (180 / Math.PI);

      const lon = this.longitude + Math.atan2(
        Math.sin(bearing) * Math.sin(angularDist) * Math.cos(this.latitude * Math.PI / 180),
        Math.cos(angularDist) - Math.sin(this.latitude * Math.PI / 180) * Math.sin(lat * Math.PI / 180)
      ) * (180 / Math.PI);

      positions.push(new WorldWind.Position(lat, lon, this.altitude));
    }

    ring.positions = positions;

    if (ring.path) {
      // Assign new positions array to trigger Path's setter which calls reset()
      ring.path.positions = positions;

      // Update attributes in place
      ring.path.attributes.outlineColor = new WorldWind.Color(
        this.baseColor.red,
        this.baseColor.green,
        this.baseColor.blue,
        opacity
      );
      ring.path.attributes.outlineWidth = 2.5 - (ring.index * 0.3);
    } else {
      // Create new path with attributes
      const attrs = new WorldWind.ShapeAttributes(null);
      attrs.outlineColor = new WorldWind.Color(
        this.baseColor.red,
        this.baseColor.green,
        this.baseColor.blue,
        opacity
      );
      attrs.outlineWidth = 2.5 - (ring.index * 0.3);
      attrs.drawInterior = false;
      attrs.applyLighting = false;

      ring.path = new WorldWind.Path(positions, attrs);
      ring.path.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
      ring.path.followTerrain = false;
      ring.path.extrude = false;
    }
  }

  /**
   * Update animation (called every frame)
   */
  update(time) {
    // Update each ring
    this.rings.forEach(ring => {
      this.updateRingGeometry(ring, time);
    });

    // Pulse the center marker
    const pulse = Math.sin(time * this.pulseSpeed * Math.PI * 2 + this.pulseOffset);
    const scale = 0.35 + ((pulse + 1) / 2) * 0.15; // Scale between 0.35 and 0.5
    if (this.centerMarker && this.centerMarker.attributes) {
      this.centerMarker.attributes.imageScale = scale;
    }
  }

  /**
   * Get all renderables for this event
   */
  getRenderables() {
    return this.renderables;
  }

  /**
   * Create canvas with radial gradient glow
   */
  createGlowCanvas(size, centerColor, edgeColor) {
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
}

/**
 * Create animated detection events
 */
export function createAnimatedDetectionEvents(animationController) {
  const detectionLocations = [
    { lat: 45, lon: -110, label: 'Track-01' },  // Northern corridor
    { lat: 35, lon: -95, label: 'Track-02' },   // Central CONUS
    { lat: 40, lon: -85, label: 'Track-03' }    // Eastern corridor
  ];

  const detectionColor = new WorldWind.Color(1.0, 0.3, 0.3, 0.8); // Red/orange
  const events = [];

  detectionLocations.forEach(loc => {
    const event = new AnimatedDetectionEvent(
      loc.lat,
      loc.lon,
      loc.label,
      detectionColor
    );

    // Register with animation controller
    if (animationController) {
      animationController.registerAnimatable(event);
    }

    events.push(event);
  });

  return events;
}

export default createAnimatedDetectionEvents;
