# WorldWind React Globe

A browser-based React application that displays an interactive 3D Earth globe using NASA Web WorldWind.

## Approach

This MVP uses NASA Web WorldWind, an open-source 3D globe library originally developed by NASA. The application:

1. **React Integration**: Uses a functional component with hooks (`useRef` and `useEffect`) to properly initialize WorldWind after the canvas mounts.
2. **Canvas-based Rendering**: WorldWind renders to a `<canvas>` element using WebGL for hardware-accelerated 3D graphics.
3. **Isolation Pattern**: WorldWind logic is contained within the `Globe` component, keeping the library separate from React's rendering cycle.

## Installation

```bash
# Clone the repository
git clone <repository-url>
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
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite bundler configuration
└── src/
    ├── main.jsx            # React app entry point
    ├── App.jsx             # Root component
    ├── index.css           # Global styles
    └── components/
        └── Globe.jsx       # WorldWind globe component
```

## Dependencies

- **react** / **react-dom**: React 18 for UI components
- **worldwindjs**: NASA Web WorldWind library (npm package)
- **vite**: Fast development server and build tool
- **@vitejs/plugin-react**: Vite plugin for React JSX support

## Globe Component

The `Globe.jsx` component is the core of the application:

```jsx
import { useEffect, useRef } from 'react';
import WorldWind from 'worldwindjs';

function Globe() {
  const canvasRef = useRef(null);
  const wwRef = useRef(null);

  useEffect(() => {
    if (wwRef.current) return;

    const wwd = new WorldWind.WorldWindow(canvasRef.current);
    wwRef.current = wwd;

    // Add imagery layer
    wwd.addLayer(new WorldWind.BMNGOneImageLayer());
    wwd.addLayer(new WorldWind.AtmosphereLayer());
    wwd.addLayer(new WorldWind.StarFieldLayer());

    wwd.redraw();

    return () => { wwRef.current = null; };
  }, []);

  return <canvas ref={canvasRef} className="globe-canvas" />;
}
```

### Key Concepts

- **WorldWindow**: The main WorldWind object that manages the WebGL canvas, layers, and navigation.
- **Layers**: Visual elements stacked on the globe. We use:
  - `BMNGOneImageLayer`: Blue Marble satellite imagery
  - `AtmosphereLayer`: Atmospheric glow effect at Earth's edge
  - `StarFieldLayer`: Background stars for context
- **Navigator**: Built-in controller for camera positioning (handled automatically).

## Mouse Interaction

WorldWind provides built-in mouse/touch interaction through its `Navigator` object:

| Action | Effect |
|--------|--------|
| **Click and drag** | Rotate/pan the globe |
| **Mouse wheel scroll** | Zoom in/out |
| **Right-click drag** | Tilt the view angle |
| **Pinch (touch)** | Zoom on mobile devices |

These interactions are enabled by default when you create a `WorldWindow` instance. WorldWind attaches event listeners to the canvas and translates mouse/touch events into camera movements automatically.

### How Navigation Works Internally

1. WorldWind's `BasicWorldWindowController` listens for mouse events on the canvas.
2. Drag events update the `Navigator.lookAtLocation` (latitude/longitude center point).
3. Wheel events adjust `Navigator.range` (distance from Earth's surface).
4. After each change, WorldWind triggers a redraw to update the WebGL scene.

## Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory, ready for static hosting.

## Notes

- The globe requires WebGL support in the browser.
- Initial load downloads satellite imagery tiles from NASA servers.
- No backend services are required; everything runs in the browser.
