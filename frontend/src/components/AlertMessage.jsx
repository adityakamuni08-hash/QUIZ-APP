import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const AlertMessage = ({ type = 'danger', message, onClose }) => {
  if (!message) return null;

  const config = {
    danger: {
      bg: 'var(--danger-bg)',
      border: 'var(--danger-border)',
      color: '#f87171',
      icon: <AlertCircle size={18} />
    },
    success: {
      bg: 'var(--success-bg)',
      border: 'var(--success-border)',
      color: '#34d399',
      icon: <CheckCircle size={18} />
    },
    warning: {
      bg: 'var(--warning-bg)',
      border: 'var(--warning-border)',
      color: '#fbbf24',
      icon: <AlertTriangle size={18} />
    },
    info: {
      bg: 'var(--info-bg)',
      border: 'rgba(59, 130, 246, 0.3)',
      color: '#60a5fa',
      icon: <Info size={18} />
    }
  }[type] || {};

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      padding: '0.85rem 1.15rem',
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 'var(--radius-md)',
      color: config.color,
      fontSize: '0.9rem',
      marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {config.icon}
        <span>{message}</span>
      </div>
      {onClose && (
        <button onClick={onClose} style={{ color: config.color, display: 'flex', alignItems: 'center' }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
