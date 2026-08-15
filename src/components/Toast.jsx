import React from 'react';

function Toast({ message, type = 'success' }) {
  if (!message) return null;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return { background: '#10b981', color: 'white' };
      case 'error':
        return { background: '#ef4444', color: 'white' };
      case 'warning':
        return { background: '#f59e0b', color: 'white' };
      default:
        return { background: '#3b82f6', color: 'white' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%) translateY(0)',
      padding: '12px 24px',
      borderRadius: '999px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '600',
      fontSize: '0.95rem',
      zIndex: 9999,
      animation: 'slideUp 0.3s ease-out forwards',
      ...getStyle()
    }}>
      {message}
    </div>
  );
}

export default Toast;
