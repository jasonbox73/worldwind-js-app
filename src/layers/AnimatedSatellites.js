import WorldWind from 'worldwindjs';

/**
 * Animated Satellite
 * Represents a satellite moving along an orbital path
 */
export class AnimatedSatellite {
  constructor(orbit, index, totalSatellites) {
    this.orbit = orbit;
    this.index = index;
    this.totalSatellites = totalSatellites;

    // Orbital parameters - use faster period for visualization (90 seconds instead of 90 minutes)
    this.orbitPeriod = 90; // 90 seconds for visible animation (real LEO would be 90 * 60)
    this.phaseOffset = (index / totalSatellites) * Math.PI * 2; // Evenly spaced
    this.orbitOffset = orbit.phaseOffset || 0;

    // Visual elements
    this.placemark = null;
    this.createVisual();
  }

  /**
   * Create the satellite visual
   */
  createVisual() {
    const attrs = new WorldWind.PlacemarkAttributes(null);

    // Create glowing satellite icon
    attrs.imageSource = this.createSatelliteCanvas(
      80,
      `rgba(${this.orbit.color.red * 255}, ${this.orbit.color.green * 255}, ${this.orbit.color.blue * 255}, 1)`,
      `rgba(${this.orbit.color.red * 255}, ${this.orbit.color.green * 255}, ${this.orbit.color.blue * 255}, 0)`
    );
    attrs.imageScale = 0.3;
    attrs.imageOffset = new WorldWind.Offset(
      WorldWind.OFFSET_FRACTION, 0.5,
      WorldWind.OFFSET_FRACTION, 0.5
    );

    // Initial position
    const initialPos = this.calculatePosition(0);

    this.placemark = new WorldWind.Placemark(initialPos, false, attrs);
    this.placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
  }

  /**
   * Calculate satellite position at given time
   */
  calculatePosition(time) {
    const { inclination, altitude } = this.orbit;

    // Calculate angular position along orbit
    const angle = ((time / this.orbitPeriod) * 360 + this.orbitOffset) % 360;
    const totalAngle = angle + (this.phaseOffset * 180 / Math.PI);

    // Calculate latitude and longitude based on orbital mechanics
    const lat = Math.sin((totalAngle) * Math.PI / 180) * inclination;
    const lon = ((totalAngle) % 360) - 180;

    return new WorldWind.Position(lat, lon, altitude);
  }

  /**
   * Update animation (called every frame)
   */
  update(time) {
    // Log every second for satellite 0
    const second = Math.floor(time);
    if (this.index === 0 && this._lastSecond !== second) {
      this._lastSecond = second;
      console.log('>>> SATELLITE 0 UPDATE - time:', time.toFixed(2));
      // Log available methods on placemark (once)
      if (!this._loggedMethods) {
        this._loggedMethods = true;
        console.log('>>> Placemark keys:', Object.keys(this.placemark));
        console.log('>>> Placemark.position:', this.placemark.position);
      }
    }

    if (this.placemark && this.placemark.position) {
      const newPos = this.calculatePosition(time);

      // Log position for satellite 0 every second
      if (this.index === 0 && this._lastSecond === second && !this._loggedThisSecond) {
        this._loggedThisSecond = true;
        console.log('>>> SATELLITE 0 POSITION - lat:', newPos.latitude.toFixed(2), 'lon:', newPos.longitude.toFixed(2));
        setTimeout(() => { this._loggedThisSecond = false; }, 900);
      }

      // Try setting position directly as new object
      this.placemark.position = new WorldWind.Position(newPos.latitude, newPos.longitude, newPos.altitude);
    }
  }

  /**
   * Get the renderable placemark
   */
  getRenderable() {
    return this.placemark;
  }

  /**
   * Create satellite icon canvas
   */
  createSatelliteCanvas(size, centerColor, edgeColor) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Outer glow
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, centerColor);
    gradient.addColorStop(0.4, centerColor.replace(/[\d.]+\)$/, '0.8)'));
    gradient.addColorStop(0.7, edgeColor.replace(/[\d.]+\)$/, '0.3)'));
    gradient.addColorStop(1, edgeColor);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Bright center
    const centerGradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 4
    );
    centerGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    centerGradient.addColorStop(0.5, centerColor.replace(/[\d.]+\)$/, '0.9)'));
    centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = centerGradient;
    ctx.fillRect(0, 0, size, size);

    return canvas;
  }
}

/**
 * Create animated satellites for all orbits
 */
export function createAnimatedSatellites(animationController) {
  const orbits = [
    {
      name: 'Polar Orbit 1',
      inclination: 97,
      altitude: 800000,
      color: new WorldWind.Color(0.4, 0.8, 1.0, 0.9),
      sensorCount: 4,
      phaseOffset: 0
    },
    {
      name: 'Polar Orbit 2',
      inclination: 82,
      altitude: 1200000,
      color: new WorldWind.Color(0.5, 0.9, 1.0, 0.9),
      sensorCount: 3,
      phaseOffset: 45
    },
    {
      name: 'MEO Orbit',
      inclination: 55,
      altitude: 2000000,
      color: new WorldWind.Color(0.6, 1.0, 1.0, 0.9),
      sensorCount: 3,
      phaseOffset: 90
    }
  ];

  const satellites = [];

  orbits.forEach(orbit => {
    for (let i = 0; i < orbit.sensorCount; i++) {
      const satellite = new AnimatedSatellite(orbit, i, orbit.sensorCount);

      // Register with animation controller
      if (animationController) {
        animationController.registerAnimatable(satellite);
      }

      satellites.push(satellite);
    }
  });

  return satellites;
}

export default createAnimatedSatellites;
