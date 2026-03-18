import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * ============================================================
 * BUTTON UI — Basket Metrics
 * ============================================================
 *
 * NOTAS PARA PABLITO
 * ------------------
 * Objetivo:
 * - Mantener compatibilidad con todos los botones actuales
 * - Unificar la estética visual del sistema
 * - Permitir que className siga ajustando detalles por pantalla
 *
 * Regla importante:
 * - no romper variantes existentes
 * - mantener primary / secondary / danger
 *
 * Mejora UI 2026:
 * - primary alineado a naranja Basket Metrics
 * - secondary dark, más consistente con panel
 * - danger más limpio
 * - rounded y focus más premium
 */

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-in-out outline-none focus:ring-2 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60';

  const variantStyles = {
    primary:
      'rounded-2xl bg-orange-500 text-white hover:bg-orange-400 focus:ring-orange-500/20 shadow-[0_10px_25px_rgba(249,115,22,0.18)] hover:shadow-[0_16px_35px_rgba(249,115,22,0.28)]',
    secondary:
      'rounded-2xl border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] focus:ring-white/10 shadow-[0_10px_24px_rgba(0,0,0,0.18)]',
    danger:
      'rounded-2xl bg-red-600 text-white hover:bg-red-500 focus:ring-red-500/20 shadow-[0_10px_24px_rgba(220,38,38,0.18)] hover:shadow-[0_14px_30px_rgba(220,38,38,0.24)]',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3.5 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? '' : 'active:scale-[0.99]'} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
