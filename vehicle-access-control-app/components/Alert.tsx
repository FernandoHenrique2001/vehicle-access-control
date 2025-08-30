
import React, { ReactNode } from 'react';
import { AlertTriangleIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: ReactNode;
  onClose?: () => void;
}

const alertStyles = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-400',
    text: 'text-green-700',
    icon: <CheckCircleIcon className="text-green-500" />,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-700',
    icon: <XCircleIcon className="text-red-500" />,
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    text: 'text-yellow-700',
    icon: <AlertTriangleIcon className="text-yellow-500" />,
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-700',
    icon: <AlertTriangleIcon className="text-blue-500" />, // Using AlertTriangle for info too, can be changed
  },
};

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles = alertStyles[type];

  return (
    <div className={`p-4 rounded-md border ${styles.bg} ${styles.border} ${styles.text} flex items-start shadow-sm my-4`}>
      <div className="flex-shrink-0 mr-3">{styles.icon}</div>
      <div className="flex-1 text-sm">
        {typeof message === 'string' ? <p>{message}</p> : message}
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-md hover:bg-opacity-20 hover:bg-current focus:outline-none">
          <XCircleIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
