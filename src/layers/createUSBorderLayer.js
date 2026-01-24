import WorldWind from 'worldwindjs';

/**
 * Creates a dedicated US border outline layer with prominent golden halo effect.
 * Uses multiple altitude layers and wide glow spread for a true "neon" appearance.
 */
export function createUSBorderLayer() {
  const borderLayer = new WorldWind.RenderableLayer('US Border');

  addUSBorderWithHalo(borderLayer);

  return borderLayer;
}

/**
 * Highly detailed continental US boundary coordinates
 */
const US_BOUNDARY_COORDS = [
  // Pacific Northwest - Washington/Canada border
  [48.99, -123.05], [49.00, -117.03],
  // Idaho/Montana/North Dakota - Canada border
  [49.00, -116.05], [49.00, -114.06], [49.00, -112.01], [49.00, -110.00],
  [49.00, -107.99], [49.00, -106.00], [49.00, -104.05], [49.00, -102.00],
  [49.00, -100.00], [49.00, -97.23],
  // Minnesota - Lake of the Woods
  [49.38, -95.15], [49.00, -95.00], [48.72, -94.69], [48.65, -93.86],
  [48.54, -93.47], [48.30, -92.98], [48.02, -92.01], [47.74, -91.45],
  // Lake Superior
  [47.46, -90.87], [47.08, -90.05], [46.77, -89.49], [46.59, -89.00],
  [46.49, -87.79], [46.50, -85.61], [46.50, -84.87],
  // Michigan Upper Peninsula / Lake Huron
  [46.27, -84.19], [46.00, -83.91], [45.82, -83.60], [45.99, -83.45],
  [46.10, -82.52], [45.80, -82.42], [45.35, -82.14],
  // Lake Huron / Michigan thumb
  [44.76, -82.64], [44.08, -82.97], [43.45, -82.52], [43.01, -82.42],
  [42.55, -82.52], [42.42, -82.90], [42.12, -83.14], [41.96, -83.11],
  // Lake Erie
  [41.73, -83.45], [41.50, -82.69], [41.68, -81.97], [41.90, -81.28],
  [42.03, -80.52], [42.27, -79.76], [42.57, -79.06],
  // New York - Lake Ontario / St Lawrence
  [43.26, -79.07], [43.45, -79.00], [43.64, -78.72], [43.63, -77.39],
  [43.99, -76.18], [44.37, -75.83], [44.70, -75.17], [44.99, -74.73],
  // Vermont / New Hampshire / Maine - Canada border
  [45.01, -73.34], [45.01, -71.50], [45.31, -70.87], [45.94, -70.25],
  [46.69, -69.00], [47.18, -68.57], [47.36, -68.32], [47.07, -67.79],
  // Maine coast
  [45.19, -67.31], [44.82, -66.96], [44.51, -67.38], [44.33, -68.04],
  [44.10, -68.82], [43.91, -69.07], [43.72, -69.78], [43.57, -70.13],
  [43.26, -70.57], [42.88, -70.82], [42.68, -70.64],
  // Massachusetts coast
  [42.07, -70.03], [41.67, -69.95], [41.52, -70.65], [41.24, -70.00],
  [41.49, -71.02], [41.39, -71.61],
  // Rhode Island / Connecticut / Long Island Sound
  [41.21, -72.48], [41.02, -73.20], [40.96, -73.65], [40.79, -73.95],
  // New Jersey coast
  [40.48, -74.04], [39.76, -74.11], [39.48, -74.26], [39.36, -74.42],
  [39.10, -74.80], [38.93, -74.96], [38.79, -75.05], [38.45, -75.04],
  // Delaware / Maryland / Virginia - Chesapeake Bay area
  [38.02, -75.24], [37.56, -75.62], [37.19, -75.94], [36.93, -76.03],
  [36.55, -76.01], [36.14, -75.78], [35.77, -75.54], [35.25, -75.51],
  // North Carolina - Outer Banks
  [35.07, -75.98], [34.69, -76.51], [34.53, -77.07], [34.20, -77.79],
  [33.87, -78.02], [33.66, -78.93],
  // South Carolina coast
  [33.21, -79.18], [32.86, -79.64], [32.52, -80.07], [32.03, -80.85],
  // Georgia coast
  [31.54, -81.11], [31.13, -81.40], [30.71, -81.44],
  // Florida - Atlantic coast
  [30.36, -81.41], [29.79, -81.26], [29.24, -81.05], [28.59, -80.58],
  [28.01, -80.37], [27.21, -80.13], [26.53, -80.03], [26.00, -80.11],
  [25.48, -80.35],
  // Florida Keys
  [25.12, -80.40], [24.76, -80.88], [24.55, -81.77], [24.54, -82.18],
  [24.71, -82.72], [25.00, -81.68],
  // Florida - Gulf coast
  [25.95, -81.72], [26.47, -81.87], [26.95, -82.26], [27.53, -82.63],
  [27.87, -82.79], [28.17, -82.77], [28.69, -82.66], [28.96, -82.80],
  [29.05, -83.15], [29.30, -83.37], [29.68, -83.59], [29.84, -84.02],
  [29.78, -84.68], [30.00, -85.00], [30.15, -85.61], [30.28, -86.10],
  [30.28, -86.98], [30.23, -87.52], [30.25, -88.08],
  // Alabama / Mississippi Gulf coast
  [30.23, -88.47], [30.21, -89.00], [30.18, -89.35],
  // Louisiana - Mississippi Delta
  [29.76, -89.49], [29.37, -89.73], [29.26, -89.50], [29.07, -89.15],
  [29.18, -90.02], [29.09, -90.23], [29.18, -90.64], [29.42, -91.28],
  [29.53, -91.89], [29.58, -92.31], [29.75, -93.35], [29.78, -93.84],
  // Texas Gulf coast
  [29.55, -94.76], [29.31, -94.79], [28.95, -95.26], [28.64, -95.98],
  [28.34, -96.44], [27.86, -97.02], [27.28, -97.39], [26.53, -97.37],
  [26.07, -97.17], [25.97, -97.14], [25.90, -97.40],
  // Texas - Mexico border (Rio Grande)
  [26.06, -97.56], [26.42, -98.30], [26.78, -99.10], [27.47, -99.51],
  [27.78, -99.78], [28.17, -100.33], [28.96, -100.74], [29.37, -100.94],
  [29.56, -101.40], [29.75, -101.85], [29.79, -102.32], [29.55, -103.09],
  [29.88, -103.30], [30.38, -104.02], [30.70, -104.70], [31.13, -105.01],
  [31.39, -105.59], [31.75, -106.53],
  // New Mexico / Arizona - Mexico border
  [31.78, -106.62], [31.79, -108.21], [31.33, -109.05], [31.34, -111.07],
  // Arizona / California - Mexico border
  [32.49, -114.81], [32.72, -114.72], [32.62, -117.13],
  // California coast
  [32.84, -117.26], [33.15, -117.33], [33.54, -117.78], [33.74, -118.19],
  [33.97, -118.47], [34.03, -118.52], [34.04, -118.82], [34.46, -120.00],
  [34.58, -120.65], [35.16, -120.87], [35.50, -121.12], [35.80, -121.40],
  [36.31, -121.90], [36.64, -121.93], [36.97, -122.04], [37.18, -122.39],
  [37.51, -122.52], [37.79, -122.51], [37.93, -122.69], [38.02, -122.94],
  [38.32, -123.05], [38.77, -123.53], [38.96, -123.70], [39.43, -123.82],
  [39.80, -123.83], [40.26, -124.10], [40.44, -124.41], [40.93, -124.14],
  [41.46, -124.06], [41.99, -124.21], [42.00, -124.53],
  // Oregon coast
  [42.51, -124.43], [42.84, -124.56], [43.23, -124.40], [43.67, -124.19],
  [44.14, -124.11], [44.64, -124.06], [45.09, -123.96], [45.56, -123.96],
  [45.91, -123.96], [46.23, -123.96],
  // Washington coast
  [46.27, -124.02], [46.63, -124.05], [47.00, -124.36], [47.54, -124.44],
  [47.80, -124.63], [48.16, -124.69], [48.38, -124.68], [48.51, -124.72],
  [48.38, -123.97], [48.42, -123.12], [48.65, -123.00],
  // Close the loop back to start
  [48.99, -123.05]
];

/**
 * Creates the US border with a multi-layer halo effect
 */
function addUSBorderWithHalo(layer) {
  const baseAltitude = 10000; // meters

  // Create outer halo layers (wide, diffuse glow)
  // These create the soft outer halo
  const outerHaloLayers = [
    { width: 40, alpha: 0.03, altOffset: 5000 },
    { width: 32, alpha: 0.05, altOffset: 4000 },
    { width: 26, alpha: 0.07, altOffset: 3000 },
    { width: 20, alpha: 0.10, altOffset: 2000 },
    { width: 16, alpha: 0.12, altOffset: 1500 },
    { width: 12, alpha: 0.15, altOffset: 1000 },
  ];

  // Create middle glow layers (medium intensity)
  const middleGlowLayers = [
    { width: 10, alpha: 0.20, altOffset: 800 },
    { width: 8, alpha: 0.30, altOffset: 600 },
    { width: 6, alpha: 0.40, altOffset: 400 },
    { width: 5, alpha: 0.50, altOffset: 200 },
  ];

  // Create core layers (bright center)
  const coreLayers = [
    { width: 4, alpha: 0.70, altOffset: 100 },
    { width: 3, alpha: 0.85, altOffset: 50 },
    { width: 2, alpha: 1.0, altOffset: 0 },
  ];

  // Combine all layers
  const allLayers = [...outerHaloLayers, ...middleGlowLayers, ...coreLayers];

  // Add each halo layer
  allLayers.forEach(({ width, alpha, altOffset }) => {
    const positions = US_BOUNDARY_COORDS.map(([lat, lon]) =>
      new WorldWind.Position(lat, lon, baseAltitude + altOffset)
    );

    const attrs = new WorldWind.ShapeAttributes(null);
    // Golden color with varying alpha for halo effect
    attrs.outlineColor = new WorldWind.Color(1.0, 0.78, 0.25, alpha);
    attrs.outlineWidth = width;
    attrs.drawInterior = false;

    const path = new WorldWind.Path(positions, attrs);
    path.altitudeMode = WorldWind.RELATIVE_TO_GROUND;
    path.followTerrain = false;
    path.extrude = false;
    layer.addRenderable(path);
  });

  // Add a subtle interior fill for additional glow effect
  const fillPositions = US_BOUNDARY_COORDS.map(([lat, lon]) =>
    new WorldWind.Location(lat, lon)
  );

  const fillAttrs = new WorldWind.ShapeAttributes(null);
  fillAttrs.interiorColor = new WorldWind.Color(1.0, 0.8, 0.3, 0.08);
  fillAttrs.outlineColor = new WorldWind.Color(0, 0, 0, 0); // No outline
  fillAttrs.drawOutline = false;

  const fillPolygon = new WorldWind.SurfacePolygon(fillPositions, fillAttrs);
  layer.addRenderable(fillPolygon);
}

export default createUSBorderLayer;
