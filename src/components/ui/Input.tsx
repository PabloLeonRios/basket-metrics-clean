import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Opcional: para manejar estados de error visualmente
  error?: boolean;
  // Opcional: variante de tamaño si se necesita
  inputSize?: 'sm' | 'md' | 'lg';
}

/**
 * ============================================================
 * INPUT UI — Basket Metrics
 * ============================================================
 *
 * NOTAS PARA PABLITO
 * ------------------
 * Objetivo:
 * - Mantener compatibilidad con todos los formularios actuales
 * - Permitir que cada pantalla pueda customizar visualmente el input con className
 *
 * Regla importante:
 * - className debe poder sobrescribir/redondear/oscurecer estilos base
 * - no romper formularios viejos que usen este Input sin className
 *
 * Mejora UI 2026:
 * - base más neutra y compatible con dark system
 * - focus naranja en vez de azul
 * - mejor transición visual
 */

const Input: React.FC<InputProps> = ({
  error = false,
  inputSize = 'md',
  className = '',
  ...props
}) => {
  const baseStyles =
    'w-full border text-white placeholder:text-white/25 outline-none transition-all duration-200';

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm rounded-xl',
    md: 'px-4 py-3 text-base rounded-2xl',
    lg: 'px-4 py-3.5 text-lg rounded-2xl',
  };

  const defaultVisualStyles = error
    ? 'border-red-500/60 bg-red-500/5 focus:border-red-400 focus:ring-2 focus:ring-red-500/20'
    : 'border-white/10 bg-white/[0.04] focus:border-orange-400/30 focus:ring-2 focus:ring-orange-500/10';

  const disabledStyles = props.disabled
    ? 'cursor-not-allowed opacity-60'
    : '';

  return (
    <input
      className={`${baseStyles} ${sizeStyles[inputSize]} ${defaultVisualStyles} ${disabledStyles} ${className}`.trim()}
      {...props}
    />
  );
};

export default Input;
