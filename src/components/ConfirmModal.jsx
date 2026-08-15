import React from 'react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backdropFilter: 'blur(4px)'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '90%', maxWidth: '400px', backgroundColor: 'white', 
        padding: '2rem', textAlign: 'center'
      }}>
        <h3 style={{ color: '#d97706', marginBottom: '1rem', fontSize: '1.4rem' }}>
          ⚠️ {title}
        </h3>
        <p style={{ color: 'var(--text-main)', marginBottom: '2rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
            style={{ minWidth: '100px' }}
          >
            取消
          </button>
          <button 
            className="btn btn-primary" 
            style={{ backgroundColor: '#f59e0b', minWidth: '100px' }}
            onClick={onConfirm}
          >
            確定重排
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
