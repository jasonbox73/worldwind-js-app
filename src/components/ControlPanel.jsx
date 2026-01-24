import { useState } from 'react';
import './ControlPanel.css';

/**
 * Control panel for managing defense visualization layers
 * Features:
 * - Layer toggles for defense domes
 * - Sensor network toggle
 * - Grid/boundary overlays
 * - Visual legend
 */
function ControlPanel({ layers, onLayerToggle }) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const layerConfig = [
    {
      id: 'terminal',
      name: 'Terminal Defense',
      description: 'Endo-atmospheric (50-150km)',
      color: '#FFC033',
      icon: '🛡️'
    },
    {
      id: 'midcourse',
      name: 'Midcourse Defense',
      description: 'Exo-atmospheric (150-1000km)',
      color: '#3399FF',
      icon: '🚀'
    },
    {
      id: 'spaceBased',
      name: 'Space-Based Detection',
      description: 'LEO/MEO sensors (1000-2000km)',
      color: '#66FFFF',
      icon: '🛰️'
    },
    {
      id: 'sensors',
      name: 'Sensor Network',
      description: 'Orbital tracking assets',
      color: '#66DDFF',
      icon: '📡'
    },
    {
      id: 'animatedSatellites',
      name: 'Moving Satellites',
      description: 'Animated orbital satellite motion',
      color: '#66DDFF',
      icon: '🛸'
    },
    {
      id: 'animatedEvents',
      name: 'Active Tracking',
      description: 'Animated threat detection events',
      color: '#FF5050',
      icon: '🎯'
    },
    {
      id: 'usBorder',
      name: 'US Border',
      description: 'Continental US outline',
      color: '#FFB833',
      icon: '🇺🇸'
    },
    {
      id: 'overlay',
      name: 'Grid & Boundaries',
      description: 'Coordinate grid and flight paths',
      color: '#88BBFF',
      icon: '🗺️'
    }
  ];

  return (
    <>
      {/* Toggle button when panel is closed */}
      {!isPanelOpen && (
        <button
          className="panel-toggle-btn"
          onClick={() => setIsPanelOpen(true)}
          title="Open Control Panel"
        >
          ☰
        </button>
      )}

      {/* Main control panel */}
      {isPanelOpen && (
        <div className="control-panel">
          {/* Header */}
          <div className="panel-header">
            <div className="panel-title">
              <span className="title-icon">⚔️</span>
              <span>GOLDEN DOME</span>
            </div>
            <button
              className="panel-close-btn"
              onClick={() => setIsPanelOpen(false)}
              title="Close Panel"
            >
              ✕
            </button>
          </div>

          {/* Subtitle */}
          <div className="panel-subtitle">
            Layered Defense System
          </div>

          {/* Layer controls */}
          <div className="layer-controls">
            {layerConfig.map((layer) => (
              <div key={layer.id} className="layer-control-item">
                <div className="layer-info">
                  <div className="layer-header">
                    <span className="layer-icon">{layer.icon}</span>
                    <span className="layer-name">{layer.name}</span>
                  </div>
                  <div className="layer-description">{layer.description}</div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={layers[layer.id] || false}
                    onChange={(e) => onLayerToggle(layer.id, e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="panel-legend">
            <div className="legend-title">Legend</div>
            <div className="legend-items">
              {layerConfig.slice(0, 3).map((layer) => (
                <div key={layer.id} className="legend-item">
                  <div
                    className="legend-color"
                    style={{ backgroundColor: layer.color }}
                  ></div>
                  <span className="legend-label">{layer.name}</span>
                </div>
              ))}
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: '#FF5050' }}
                ></div>
                <span className="legend-label">Active Tracking</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: '#80FFD0', opacity: 0.5 }}
                ></div>
                <span className="legend-label">Sensor Handoff</span>
              </div>
              <div className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: '#FFB833' }}
                ></div>
                <span className="legend-label">US Border</span>
              </div>
            </div>
          </div>

          {/* Status footer */}
          <div className="panel-footer">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span className="status-text">System Nominal</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ControlPanel;
