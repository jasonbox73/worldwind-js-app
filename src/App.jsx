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
    terminal: false,
    midcourse: false,
    spaceBased: false,
    sensors: false,
    overlay: false
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
