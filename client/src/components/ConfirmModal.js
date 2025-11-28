import React, { useState } from 'react';
import './ConfirmModal.css';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'confirm', inputLabel = '', inputPlaceholder = '' }) {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (type === 'input') {
      onConfirm(inputValue);
      setInputValue('');
    } else {
      onConfirm();
    }
    onClose();
  };

  const handleCancel = () => {
    setInputValue('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && type === 'input' && inputValue.trim()) {
      handleConfirm();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleCancel}>
      <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <h3>{title}</h3>
        </div>
        
        <div className="confirm-modal-body">
          <p>{message}</p>
          {type === 'input' && (
            <div className="modal-input-group">
              {inputLabel && <label>{inputLabel}</label>}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={inputPlaceholder}
                autoFocus
                className="modal-input"
              />
            </div>
          )}
        </div>
        
        <div className="confirm-modal-footer">
          <button 
            className="modal-btn modal-btn-cancel" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className={`modal-btn modal-btn-confirm ${type === 'delete' ? 'modal-btn-danger' : ''}`}
            onClick={handleConfirm}
            disabled={type === 'input' && !inputValue.trim()}
          >
            {type === 'delete' ? 'Delete' : type === 'input' ? 'Save' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
