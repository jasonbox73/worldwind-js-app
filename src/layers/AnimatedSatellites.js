import WorldWind from 'worldwindjs';
import OBJLoader from '../utils/OBJLoader';
import SatelliteShape from '../shapes/SatelliteShape';

/**
 * Animated Satellite
 * Represents a satellite moving along an orbital path using 3D models
 */
export class AnimatedSatellite {
  constructor(orbit, index, totalSatellites, modelData) {
    this.orbit = orbit;
    this.index = index;
    this.totalSatellites = totalSatellites;
    this.modelData = modelData; // Add model data

    // Orbital parameters - use faster period for visualization (90 seconds instead of 90 minutes)
    this.orbitPeriod = 90; // 90 seconds for visible animation (real LEO would be 90 * 60)
    this.phaseOffset = (index / totalSatellites) * Math.PI * 2; // Evenly spaced
    this.orbitOffset = orbit.phaseOffset || 0;

    // Visual elements
    this.satelliteShape = null; // Changed from placemark
    this.createVisual();
  }

  /**
   * Create the satellite visual using 3D model
   */
  createVisual() {
    // Initial position
    const initialPos = this.calculatePosition(0);

    // Create 3D satellite shape
    this.satelliteShape = new SatelliteShape(
      initialPos,
      this.modelData,
      this.orbit.color
    );

    this.satelliteShape.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
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
    if (this.satelliteShape) {
      const newPos = this.calculatePosition(time);
      this.satelliteShape.updatePosition(newPos);

      // Update heading based on orbital motion
      const angle = ((time / this.orbitPeriod) * 360) % 360;
      this.satelliteShape.updateHeading(angle);
    }
  }

  /**
   * Get the renderable shape
   */
  getRenderable() {
    return this.satelliteShape;
  }
}

/**
 * Create animated satellites for all orbits
 */
export async function createAnimatedSatellites(animationController) {
  // Load satellite model once, reuse for all instances
  const loader = new OBJLoader();
  const geometry = await loader.load('/space-satellite/source/Satellite2.obj');
  const modelData = loader.toArrays();

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
      const satellite = new AnimatedSatellite(orbit, i, orbit.sensorCount, modelData);

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
