# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Golden Dome is a geospatial, multi-domain visualization platform for modeling and analyzing layered national missile defense architecture over the continental United States. Built with NASA WorldWind (WebGL-based 3D globe rendering) and React 18.

**Key Concept**: The application visualizes three concentric hemispherical defense layers (Terminal, Midcourse, Space-Based) with an orbital sensor network, creating a unified operational picture for strategic planning and briefings.

**Current Status**: Phase 1 (static visualization) is 100% complete and production-ready. Phase 2 (animation system) has been implemented with `AnimationController`, `AnimatedSatellites`, and `AnimatedDetectionEvents` files created, but animations may require debugging if not functioning.

## Development Commands

```bash
# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production (output to dist/)
npm run build

# Preview production build
npm run preview
```

## Architecture

### Component Hierarchy

```
App.jsx (root state management)
├── Globe.jsx (WorldWind integration + layer orchestration)
│   ├── createDefenseDomes.js (3 hemispherical layers - STATIC)
│   ├── createSensorLayer.js (orbital paths + static satellites + handoff links - STATIC)
│   ├── AnimatedSatellites.js (moving satellites along orbits - ANIMATED)
│   ├── AnimatedDetectionEvents.js (pulsing detection markers - ANIMATED)
│   ├── createUSBorderLayer.js (US border outline with halo effect - STATIC)
│   └── createOverlayLayer.js (grid + flight paths - STATIC)
└── ControlPanel.jsx (layer toggles + legend + status)
```

### State Flow

1. **App.jsx** holds central state for all layer visibility toggles (`layerStates`) with 8 toggleable items:
   - `terminal`, `midcourse`, `spaceBased` (defense domes)
   - `sensors` (static sensor network)
   - `animatedSatellites`, `animatedEvents` (animated layers)
   - `usBorder` (US border outline with halo effect)
   - `overlay` (grid and boundaries)

2. **Globe.jsx** receives `layerStates` as props and manages:
   - WorldWindow instance (stored in `wwRef.current`)
   - Layer references (stored in `layersRef.current`)
   - AnimationController instance (stored in `animationControllerRef.current`)
   - Animated objects (stored in `animatedEventsRef.current`)

3. **Layer toggling**: User clicks ControlPanel → App updates state → Globe's useEffect (lines 144-161) syncs `layer.enabled` → WorldWindow redraws

### Critical Implementation Details

**Hemispherical Dome Construction** (`createDefenseDomes.js`):
- Each dome is created using spherical geometry calculations (great circle math using haversine formulas)
- 24 meridian arcs (vertical lines from base to apex) + 8 parallel arcs (horizontal circles at various heights)
- Base coverage uses `SurfacePolygon` with semi-transparent fill at 5000m altitude
- Glow effects achieved by layering multiple `Path` objects with decreasing alpha (`addGlowingPath` helper function)
- Each dome returns an array of WorldWind renderables (paths + base polygon)

**Defense Layer Specifications**:
- **Terminal Defense**: 2200km radius, 100km altitude, gold color (#FFC033), represents endo-atmospheric interception (50-150km)
- **Midcourse Defense**: 2800km radius, 500km altitude, blue color (#3399FF), represents exo-atmospheric interception (150-1000km)
- **Space-Based Detection**: 3500km radius, 1500km altitude, cyan color (#66FFFF), represents LEO/MEO detection layer (1000-2000km)
- **Center Point**: All domes centered at CONUS center (39.8°N, 98.5°W)

**Sensor Network** (`createSensorLayer.js`):
- Creates static visualization of 10 satellites across 3 orbital planes
- **Orbital paths**: Circular arcs showing satellite trajectories
- **Detection events**: 3 static markers (Track-01, Track-02, Track-03) at specific CONUS locations
- **Handoff links**: Dashed lines connecting sensors from different orbits (< 60° angular distance)
- Uses dual-layer glow effects for sensor nodes (outer glow + bright center)

**US Border Layer** (`createUSBorderLayer.js`):
- Creates golden outline of continental US with multi-layer halo effect
- **Halo effect**: 13 stacked path layers at different altitudes and widths
  - 6 outer halo layers (wide 40-12px, very transparent 3-15% alpha)
  - 4 middle glow layers (medium 10-5px, medium opacity 20-50% alpha)
  - 3 core layers (narrow 4-2px, bright 70-100% alpha)
- **Interior fill**: Subtle SurfacePolygon with 8% alpha for warm glow
- ~180 coordinate points for detailed border outline
- Base altitude: 10,000m with offsets up to 5,000m for halo depth

**Animation System** (`AnimationController.js`, `AnimatedSatellites.js`, `AnimatedDetectionEvents.js`):
- **AnimationController**: Manages 60 FPS rendering loop using `requestAnimationFrame`
  - Tracks `animationTime` (accumulated time in seconds, adjusted by speed multiplier)
  - Objects register via `registerAnimatable(obj)` - they must implement `update(time)` method
  - Started in Globe.jsx line 110 with `animationController.start()`
  - Calls `wwd.redraw()` on every frame when playing

- **AnimatedSatellite class**: Represents moving satellites
  - Calculates orbital position using simplified orbital mechanics
  - 90-minute orbital period (typical LEO)
  - Position formula: `lat = sin(angle) * inclination`, `lon = (angle % 360) - 180`
  - Each satellite is evenly spaced along its orbit using phase offsets
  - Updates placemark position every frame

- **AnimatedDetectionEvent class**: Represents pulsing threat detection markers
  - Creates 3 staggered pulsing rings per event
  - Rings expand/contract between 2-5° radius using sine wave
  - Opacity fades as rings expand
  - Center marker also pulses in scale
  - Uses `updateRingGeometry()` to recalculate ring positions every frame

**Integration Flow** (Globe.jsx lines 70-110):
1. Create AnimationController
2. Create static sensor layer
3. Create animated detection events, register with controller, add renderables to layer
4. Create animated satellites, register with controller, add renderables to layer
5. Start animation loop

### Layer System

WorldWind renders layers in order added. Current stack (bottom to top):
1. **StarFieldLayer** (always visible) - background stars
2. **BMNGLayer** (always visible) - Blue Marble earth imagery
3. **AtmosphereLayer** (always visible) - atmospheric glow effect
4. **Terminal Defense** (toggleable) - gold dome
5. **Midcourse Defense** (toggleable) - blue dome
6. **Space-Based Detection** (toggleable) - cyan dome
7. **Sensor Network** (toggleable) - static orbital paths, sensors, detection events, handoff links
8. **Animated Detection Events** (toggleable) - pulsing threat markers
9. **Animated Satellites** (toggleable) - moving satellite placemarks
10. **US Border** (toggleable) - golden outline of continental US with halo effect
11. **Overlay** (toggleable) - coordinate grid + flight paths

**Note**: Both static sensors (layer 7) and animated satellites (layer 9) can be enabled simultaneously - they represent different visualization modes.

### Known Issues & Debugging

**If animations don't work**:
1. Check browser console for errors (especially StarFieldLayer JSON parse errors)
2. Verify `animationController.start()` was called (Globe.jsx:110)
3. Confirm animated objects were registered before `start()` call
4. Check that animated layer toggles in ControlPanel are enabled
5. Verify `layer.enabled` state matches control panel UI
6. Test animation loop with: `console.log(animationController.getTime())` to see if time is advancing

**StarFieldLayer Issue**:
- May throw JSON parse error on `stars.json` file from worldwindjs package
- Error is non-blocking and can be wrapped in try/catch
- StarFieldLayer will still render background stars despite error

**Performance debugging**:
- Target: 60 FPS with all layers enabled
- Static layers: ~500 renderables total
- Animated layers add 13 objects (10 satellites + 3 events) that update each frame
- Use Chrome DevTools Performance tab to profile frame rate
- Check for dropped frames during animation playback

## File Organization

```
src/
├── components/
│   ├── Globe.jsx                     # WorldWind integration, layer orchestration
│   ├── ControlPanel.jsx              # UI controls with 8 layer toggles
│   └── ControlPanel.css              # Military-themed control panel styling
├── layers/
│   ├── createDefenseDomes.js         # 3 static hemispherical domes
│   ├── createSensorLayer.js          # Static sensors, orbits, detection events, handoffs
│   ├── AnimatedSatellites.js         # Animated satellites moving along orbits
│   ├── AnimatedDetectionEvents.js    # Pulsing detection markers
│   ├── createUSBorderLayer.js        # US border outline with multi-layer halo effect
│   └── createOverlayLayer.js         # Coordinate grid + flight paths
├── utils/
│   └── AnimationController.js        # 60 FPS animation loop manager
├── App.jsx                           # Root component with layer state management
├── main.jsx                          # React entry point
└── index.css                         # Global styles (dark theme, canvas sizing)
```

## Color Coding System

The application uses a consistent military color scheme:

```javascript
// Terminal Defense (endo-atmospheric, 50-150km)
Fill: rgba(255, 192, 51, 0.15) - #FFC033 with low alpha
Edge: rgba(255, 217, 77, 0.6)  - gold edge glow

// Midcourse Defense (exo-atmospheric, 150-1000km)
Fill: rgba(51, 128, 255, 0.12) - #3399FF with low alpha
Edge: rgba(77, 153, 255, 0.5)  - blue edge glow

// Space-Based Detection (LEO/MEO, 1000-2000km)
Fill: rgba(102, 230, 255, 0.08) - #66FFFF with low alpha
Edge: rgba(128, 242, 255, 0.4)  - cyan edge glow

// Active Tracking (detection events - animated)
Base: rgba(255, 77, 77, 0.8) - #FF5050 red/orange pulsing rings

// Sensor Handoff Links (static)
Color: rgba(128, 255, 208, 0.5) - #80FFD0 cyan-green dashed lines

// US Border (halo effect)
Core: rgba(255, 199, 64, 1.0) - #FFC740 bright gold center line
Halo: rgba(255, 199, 64, 0.03-0.15) - graduated alpha for outer glow
Fill: rgba(255, 204, 77, 0.08) - subtle interior fill

// Sensor Nodes
Polar Orbit 1 (800km): rgba(102, 204, 255, 0.9)
Polar Orbit 2 (1200km): rgba(128, 230, 255, 0.9)
MEO Orbit (2000km): rgba(153, 255, 255, 0.9)
```

## Performance Targets

- **Target FPS**: 60 FPS (both static and animated)
- **Static Performance**: 60 FPS achieved with ~500 renderables
- **Animation Performance**: 60 FPS target with 13 animated objects updating at 780 updates/sec
- **Optimization Notes**:
  - WorldWind uses WebGL hardware acceleration
  - Animation loop only redraws when `isPlaying` is true
  - Avoid creating new renderables in animation loops - modify existing objects
  - Use `RELATIVE_TO_GROUND` altitude mode for better performance

## Security & Data Classification

This is an **unclassified** planning and visualization tool:
- Uses notional/simulated data only
- No classified system parameters
- Generic defense concepts for educational/planning purposes
- Safe for public demonstration and briefings

## Technical Notes

**WorldWind Coordinate System**:
- Positions: `new WorldWind.Position(latitude, longitude, altitude)`
- Altitude in meters above ground (not MSL)
- Common altitude modes:
  - `WorldWind.RELATIVE_TO_GROUND` - altitude relative to terrain (used for domes)
  - `WorldWind.ABSOLUTE` - altitude relative to sea level

**Camera Setup** (Globe.jsx lines 118-126):
```javascript
wwd.navigator.range = 15000000;  // 15,000 km distance from surface
wwd.navigator.tilt = 65;          // Dramatic angle for 3D effect
wwd.navigator.heading = 0;         // North-facing
wwd.navigator.lookAtLocation.latitude = 38;   // CONUS center (slight offset)
wwd.navigator.lookAtLocation.longitude = -97;
```

**User Interaction**:
- Pan: Click and drag
- Zoom: Mouse wheel
- Tilt: Right-click and drag
- Mobile: Touch and pinch gestures

**Dependencies**:
- `worldwindjs@^1.7.0` - NASA's WebGL-based 3D globe library
- `react@^18.2.0` / `react-dom@^18.2.0` - UI framework
- `vite@^7.3.1` - Fast build tool and dev server
- `@vitejs/plugin-react@^4.2.1` - React Fast Refresh support

## Common Development Patterns

**Adding a new static layer**:
1. Create factory function in `src/layers/createNewLayer.js` that returns `RenderableLayer`
2. Import in `Globe.jsx` initialization useEffect (lines 29-142)
3. Instantiate layer, set `enabled = false`, store in `layersRef.current.newLayer`
4. Add to WorldWindow: `wwd.addLayer(newLayer)`
5. Add state to `App.jsx` layerStates object
6. Add toggle control in `ControlPanel.jsx`

**Adding a new animated layer**:
1. Create class in `src/layers/AnimatedNewLayer.js` with:
   - Constructor that creates WorldWind renderables
   - `update(time)` method that modifies renderable properties based on time
   - `getRenderables()` or `getRenderable()` method
2. Create factory function that instantiates objects and registers with AnimationController
3. In `Globe.jsx`, create layer, call factory, add renderables, register objects BEFORE `start()`
4. Add state and control same as static layer

**Debugging rendering issues**:
```javascript
// Check if layer is enabled
console.log(layersRef.current.myLayer.enabled);

// Force redraw
wwd.redraw();

// Check animation time is advancing
console.log(animationController.getTime());

// Verify object is registered
console.log(animationController.animatableObjects.length);

// Check for WebGL errors in console
// Check Performance tab in Chrome DevTools for FPS
```

**Modifying dome geometry**:
- Dome parameters in `createDefenseDomes.js`:
  - `radiusKm` - surface coverage radius
  - `altitudeKm` - peak height of dome
  - `numMeridians` - number of vertical arcs (default: 24)
  - `numParallels` - number of horizontal rings (default: 8)
- Increasing arc counts improves visual smoothness but reduces performance

## Use Cases

The application is designed for:
1. **Strategic Planning** - Visualize defense coverage and identify gaps
2. **Senior Briefings** - Professional military-themed presentations
3. **Training & Education** - Understanding layered defense concepts
4. **Sensor Analysis** - Assess orbital sensor placement and handoff timing
5. **Coverage Assessment** - Identify areas within/outside defense layers

**Not suitable for**:
- Real-time threat tracking (this is a planning tool, not operational C2)
- Classified operational planning (uses only notional data)
- Precise engagement simulation (simplified physics models)
