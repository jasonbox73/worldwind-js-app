# Golden Dome - Layered Defense System Planner

A geospatial, multi-domain visualization platform for modeling and analyzing layered national missile defense architecture over the continental United States. Built with NASA WorldWind and React.

![Golden Dome Visualization](docs/golden-dome-preview.png)

## Overview

The Golden Dome Military Planner Application provides an interactive 3D visualization of a layered missile defense architecture, integrating space-based sensing, midcourse interception, and terminal defense into a unified operational picture.

### Key Features

- **3D Earth Visualization** - High-quality WebGL-rendered globe with realistic atmosphere and lighting
- **Layered Defense Domes** - Three semi-transparent hemispherical layers representing:
  - **Terminal Defense** (endo-atmospheric, 50-150km) - Gold/amber colored
  - **Midcourse Defense** (exo-atmospheric, 150-1000km) - Blue colored
  - **Space-Based Detection** (LEO/MEO, 1000-2000km) - Cyan colored
- **Sensor Network** - Orbital paths with satellite nodes and detection coverage indicators
- **Professional Control Panel** - Military/technical aesthetic with layer toggles and legend
- **US Border** - Golden outline of continental US with multi-layer halo effect
- **Grid & Overlays** - Coordinate grid overlay and flight path visualization

## Technology Stack

- **React 18** - Modern UI framework with hooks
- **NASA WorldWind** - Open-source 3D globe WebGL library
- **Vite** - Fast development server and build tool

## Installation

```bash
# Clone the repository
git clone https://github.com/jasonbox73/worldwind-js-app.git
cd worldwind-js-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
worldwind-js-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx               # Root component with state management
    ├── index.css             # Global styles
    ├── components/
    │   ├── Globe.jsx         # WorldWind integration component
    │   ├── ControlPanel.jsx  # Layer control interface (8 toggles)
    │   └── ControlPanel.css  # Control panel styling
    ├── layers/
    │   ├── createDefenseDomes.js   # Hemispherical defense layers
    │   ├── createSensorLayer.js    # Orbital sensors and paths
    │   ├── createUSBorderLayer.js  # US border with halo effect
    │   └── createOverlayLayer.js   # Grid and flight path overlays
    └── utils/
        └── AnimationController.js  # 60 FPS animation loop manager
```

## Usage

### Layer Controls

The control panel on the right side provides toggles for:

1. **Terminal Defense** - Toggle the innermost defense layer
2. **Midcourse Defense** - Toggle the middle exo-atmospheric layer
3. **Space-Based Detection** - Toggle the outermost sensor layer
4. **Sensor Network** - Toggle orbital paths and satellite nodes
5. **Moving Satellites** - Toggle animated satellite motion
6. **Active Tracking** - Toggle animated threat detection events
7. **US Border** - Toggle golden US outline with halo effect
8. **Grid & Boundaries** - Toggle coordinate grid and flight paths

### Navigation

- **Click and drag** - Rotate the globe
- **Mouse wheel** - Zoom in/out
- **Right-click drag** - Tilt the view angle
- **Touch/pinch** - Mobile navigation

### Performance

The application is optimized for 60 FPS on modern hardware:
- WebGL hardware acceleration
- Efficient geometry generation
- Optimized layer rendering
- Smart redraw triggers

## Architecture Details

### Defense Dome System

Each dome is constructed using:
- **Meridian arcs** - Vertical lines from base to apex (24 per dome)
- **Parallel arcs** - Horizontal circles at various heights (8 per dome)
- **Base coverage** - Semi-transparent filled polygon at surface level
- **Glow effects** - Multiple layered paths for visual depth

The domes use geographic calculations to create true hemispherical shapes over the continental US center point (39.8°N, 98.5°W).

### Sensor Network

Orbital paths are modeled with:
- **Polar orbits** - High-inclination paths for global coverage
- **MEO orbits** - Medium Earth orbit sensors
- **Detection cones** - Simplified coverage indicators
- **Glowing nodes** - Satellite position markers with radial gradients

### Visual Design

The application uses a military/technical aesthetic:
- Dark blue/black space background
- Translucent layers with edge glow effects
- Color coding: Gold (terminal), Blue (midcourse), Cyan (space)
- Professional control panel with status indicators

## Development

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready for static hosting.

### Preview Production Build

```bash
npm run preview
```

## Browser Compatibility

Requires a modern browser with WebGL support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## Use Cases

1. **Strategic Planning** - Visualize defense coverage and identify gaps
2. **Briefing Support** - Clear, high-level visualization for decision-makers
3. **Training** - Educational tool for understanding layered defense concepts
4. **Analysis** - Assess sensor and interceptor placement
5. **Communication** - Reinforce deterrence messaging through visible capability

## Future Enhancements

- Animated threat trajectories
- Timeline/simulation controls
- Interceptor launch visualization
- Multi-threat scenarios
- Probabilistic kill assessments
- Export to briefing tools

## Security & Classification

This is an unclassified planning and visualization tool. It uses:
- Notional/simulated data only
- No classified system parameters
- Generic defense concepts
- Educational representations

## Credits

- **NASA WorldWind** - 3D globe rendering engine
- **Blue Marble imagery** - NASA Earth imagery
- Built for DoD planning and analysis use cases

## License

This project uses the open-source NASA WorldWind library. See individual component licenses for details.

## Support

For questions or issues:
- GitHub Issues: https://github.com/jasonbox73/worldwind-js-app/issues
- Email: jasonbox73@gmail.com

---

**Version:** 2.2.0
**Status:** Production Ready
**Last Updated:** January 24, 2026
