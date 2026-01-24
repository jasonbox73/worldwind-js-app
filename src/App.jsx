import { useState } from 'react';
import Globe from './components/Globe';
import ControlPanel from './components/ControlPanel';

/**
 * Main application component.
 * Renders the WorldWind globe with professional control panel.
 */
function App() {
  // State for all layer toggles
  const [layerStates, setLayerStates] = useState({
    terminal: true,
    midcourse: true,
    spaceBased: true,
    sensors: true,
    animatedSatellites: false,
    animatedEvents: false,
    usBorder: true,
    overlay: true
  });

  // Handle layer toggle from control panel
  const handleLayerToggle = (layerId, enabled) => {
    setLayerStates(prev => ({
      ...prev,
      [layerId]: enabled
    }));
  };

  return (
    <div className="app">
      <Globe layerStates={layerStates} />
      <ControlPanel
        layers={layerStates}
        onLayerToggle={handleLayerToggle}
      />
    </div>
  );
}

export default App;
