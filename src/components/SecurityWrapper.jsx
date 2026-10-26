'use client';

import { useEffect } from 'react';

/**
 * Componente que encapsula proteções anti-fraude e anti-cópia no frontend:
 * - Desabilita menu de contexto (botão direito)
 * - Desabilita seleção e arraste de imagens e textos
 * - Intercepta atalhos de desenvolvedor comuns (Ctrl+U, Ctrl+S, F12)
 */
export default function SecurityWrapper({ children }) {
  useEffect(() => {
    // 1. Bloquear botão direito (context menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Bloquear atalhos de teclado (Ctrl+U, Ctrl+S, F12, Ctrl+Shift+I)
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.key === 'j' || e.key === 'J'))
      ) {
        e.preventDefault();
      }
    };

    // 3. Bloquear arraste de imagens
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <div className="select-none min-h-screen">
      {children}
    </div>
  );
}
