import React from 'react';
import './KeyboardShortcuts.css';

function KeyboardShortcuts({ isOpen, onClose }) {
  const shortcuts = [
    { key: 'ESC', description: 'Close modals and dialogs' },
    { key: 'Ctrl + S', description: 'Save current meal plan', mac: '⌘ + S' },
    { key: '1', description: 'Switch to Weekly Planner' },
    { key: '2', description: 'Switch to Pantry Chef' },
    { key: '3', description: 'Switch to Recipe Search' },
    { key: 'Enter', description: 'Submit forms' },
    { key: '?', description: 'Toggle keyboard shortcuts' },
  ];

  const handleToggle = () => {
    // This will be handled by the parent through the ? key
    // Button just shows the shortcuts
    if (!isOpen) {
      // Simulate ? key press to open
      const event = new KeyboardEvent('keydown', { key: '?' });
      document.dispatchEvent(event);
    } else {
      onClose();
    }
  };

  return (
    <>
      <button 
        className="shortcuts-trigger" 
        onClick={handleToggle}
        title="Keyboard shortcuts (Press ?)"
        aria-label="Show keyboard shortcuts"
      >
        ⌨️
      </button>

      {isOpen && (
        <div className="shortcuts-overlay" onClick={onClose}>
          <div className="shortcuts-panel" onClick={(e) => e.stopPropagation()}>
            <div className="shortcuts-header">
              <h3>Keyboard Shortcuts</h3>
              <button 
                className="shortcuts-close" 
                onClick={onClose}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            
            <div className="shortcuts-list">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="shortcut-item">
                  <kbd className="shortcut-key">
                    {navigator.platform.includes('Mac') && shortcut.mac ? shortcut.mac : shortcut.key}
                  </kbd>
                  <span className="shortcut-desc">{shortcut.description}</span>
                </div>
              ))}
            </div>

            <div className="shortcuts-footer">
              <p>Press <kbd>?</kbd> anytime to toggle this panel</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default KeyboardShortcuts;
