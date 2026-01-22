import { useState } from 'react';
import Globe from './components/Globe';

/**
 * Main application component.
 * Renders the WorldWind globe with a toggle button for the overlay layer.
 */
function App() {
  const [overlayEnabled, setOverlayEnabled] = useState(false);

  const toggleOverlay = () => {
    setOverlayEnabled(prev => !prev);
  };

  return (
    <div className="app">
      <Globe overlayEnabled={overlayEnabled} />
      <button
        className="overlay-toggle"
        onClick={toggleOverlay}
      >
        {overlayEnabled ? 'Hide Overlay' : 'Show Overlay'}
      </button>
    </div>
  );
}

export default App;
