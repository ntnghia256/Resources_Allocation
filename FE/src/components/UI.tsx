import React from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

// ==================== CARD ====================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, glass = false, className = '', ...props }) => {
  return (
    <div 
      className={`
        rounded-2xl border border-slate-200/80 dark:border-slate-800/80 
        ${glass ? 'glass shadow-lg' : 'bg-white dark:bg-slate-900 shadow-sm'}
        p-6 transition-all duration-200 hover:shadow-md ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// ==================== BUTTON ====================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  className = '',
  ...props 
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm shadow-blue-200 dark:shadow-none',
    secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-slate-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm shadow-red-200 dark:shadow-none',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm shadow-emerald-200 dark:shadow-none',
    outline: 'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Đang xử lý...</span>
        </span>
      ) : children}
    </button>
  );
};

// ==================== INPUT ====================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input 
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900/60
            text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500
            transition-all duration-200 focus:outline-none focus:ring-2
            dark:[color-scheme:dark]
            ${error 
              ? 'border-red-500 focus:ring-red-400/30 focus:border-red-500' 
              : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ==================== SELECT ====================
interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative">
          <select 
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900/60
              text-slate-800 dark:text-slate-100 appearance-none
              transition-all duration-200 focus:outline-none focus:ring-2
              ${error 
                ? 'border-red-500 focus:ring-red-400/30 focus:border-red-500' 
                : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500'}
              ${className}
            `}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ==================== BADGE ====================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral' }) => {
  const styles = {
    primary: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30',
    success: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30',
    danger: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/50 dark:border-red-900/30',
    info: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200/50 dark:border-sky-900/30',
    neutral: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.75 rounded-full text-xs font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
};

// ==================== PROGRESS BAR ====================
interface ProgressBarProps {
  percent: number;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percent, showText = false }) => {
  // Determine color based on workload rules
  // < 80%: Emerald (Safe), 80-90%: Amber (Warning), > 90%: Red (Overloaded)
  let barColor = 'bg-emerald-500 dark:bg-emerald-600';
  let textColor = 'text-emerald-600 dark:text-emerald-400';
  if (percent > 90) {
    barColor = 'bg-red-500 dark:bg-red-600 animate-pulse';
    textColor = 'text-red-600 dark:text-red-400';
  } else if (percent >= 80) {
    barColor = 'bg-amber-500 dark:bg-amber-600';
    textColor = 'text-amber-600 dark:text-amber-400';
  }

  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="w-full flex items-center space-x-3">
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
      {showText && (
        <span className={`text-xs font-bold w-10 text-right ${textColor}`}>
          {percent}%
        </span>
      )}
    </div>
  );
};

// ==================== MODAL ====================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
      />
      
      {/* Modal Dialog Content */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-xl p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==================== ALERT ====================
interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', children, onClose }) => {
  const styles = {
    success: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30',
    error: 'bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-200/50 dark:border-red-900/30',
    warning: 'bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30',
    info: 'bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30',
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  return (
    <div className={`flex items-start space-x-3 p-4 rounded-xl border text-sm ${styles[type]} shadow-sm transition-all duration-200`}>
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <div className="flex-1 font-medium">{children}</div>
      {onClose && (
        <button 
          onClick={onClose}
          className="flex-shrink-0 p-0.5 rounded-lg hover:bg-slate-200/30 dark:hover:bg-slate-800/30 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
