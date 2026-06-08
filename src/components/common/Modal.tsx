import { type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, children, maxWidth = 'max-w-md' }: ModalProps) => {
  // Escape key close listener
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-64 p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-white border border-slate-200 rounded-[36px] w-full ${maxWidth} p-8 shadow-2xl animate-in zoom-in-95 duration-200 z-10`}>
        {children}
      </div>
    </div>,
    document.body
  );
};
