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

    // Orbital parameters - slower period for easy tracking
    this.orbitPeriod = 300; // 5 minutes per orbit for easy tracking
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
   * Calculate satellite position at given time using proper orbital mechanics
   */
  calculatePosition(time) {
    const { inclination, altitude, ascendingNode } = this.orbit;
    const inclinationRad = inclination * Math.PI / 180;
    const raanRad = (ascendingNode || 0) * Math.PI / 180; // Right Ascension of Ascending Node

    // Calculate angular position along orbit (in radians)
    const orbitAngle = ((time / this.orbitPeriod) * 2 * Math.PI) + this.phaseOffset;

    // Position in the orbital plane (before inclination)
    const xOrbit = Math.cos(orbitAngle);
    const yOrbit = Math.sin(orbitAngle);

    // Apply inclination rotation (rotate around X-axis)
    const x1 = xOrbit;
    const y1 = yOrbit * Math.cos(inclinationRad);
    const z1 = yOrbit * Math.sin(inclinationRad);

    // Apply RAAN rotation (rotate around Z-axis for different orbital planes)
    const x = x1 * Math.cos(raanRad) - y1 * Math.sin(raanRad);
    const y = x1 * Math.sin(raanRad) + y1 * Math.cos(raanRad);
    const z = z1;

    // Convert Cartesian to geographic coordinates
    const lat = Math.asin(z) * 180 / Math.PI;
    const lon = Math.atan2(y, x) * 180 / Math.PI;

    return new WorldWind.Position(lat, lon, altitude);
  }

  /**
   * Update animation (called every frame)
   */
  update(time) {
    if (this.satelliteShape) {
      const newPos = this.calculatePosition(time);
      this.satelliteShape.updatePosition(newPos);

      // Calculate heading based on direction of travel
      // Get position slightly ahead to determine heading
      const futurePos = this.calculatePosition(time + 0.1);
      const deltaLon = futurePos.longitude - newPos.longitude;
      const deltaLat = futurePos.latitude - newPos.latitude;

      // Calculate heading angle (0 = north, 90 = east)
      let heading = Math.atan2(deltaLon, deltaLat) * 180 / Math.PI;
      this.satelliteShape.updateHeading(heading);
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
      name: 'Orbit Plane 1',
      inclination: 45,
      altitude: 1500000,         // 1500 km - Space-Based Detection layer altitude
      ascendingNode: 0,
      color: new WorldWind.Color(0.4, 0.8, 1.0, 0.9),
      sensorCount: 6
    },
    {
      name: 'Orbit Plane 2',
      inclination: 45,
      altitude: 1500000,
      ascendingNode: 60,
      color: new WorldWind.Color(0.5, 0.9, 1.0, 0.9),
      sensorCount: 6
    },
    {
      name: 'Orbit Plane 3',
      inclination: 45,
      altitude: 1500000,
      ascendingNode: 120,
      color: new WorldWind.Color(1.0, 0.8, 0.4, 0.9),
      sensorCount: 6
    },
    {
      name: 'Orbit Plane 4',
      inclination: 60,
      altitude: 1500000,
      ascendingNode: 30,
      color: new WorldWind.Color(0.6, 1.0, 0.6, 0.9),
      sensorCount: 6
    },
    {
      name: 'Orbit Plane 5',
      inclination: 60,
      altitude: 1500000,
      ascendingNode: 90,
      color: new WorldWind.Color(1.0, 0.6, 0.8, 0.9),
      sensorCount: 6
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
