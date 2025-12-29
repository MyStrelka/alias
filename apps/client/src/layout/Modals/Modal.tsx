import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import useModalStore from '../../store/modalStore';

const Modal = () => {
  const { isOpen, closeModal, props } = useModalStore();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [closeModal]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className='bg-white rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden'
        role='dialog'
        aria-modal='true'
      >
        <div className='flex justify-between items-center p-3 border-b border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-800'>
            {props.title || 'SeaBornAlias'}
          </h3>

          <button
            onClick={() => {
              closeModal();
            }}
            className='text-gray-400 hover:text-gray-600'
            aria-label='Close modal'
          >
            <X />
          </button>
        </div>

        <div className='p-6'>
          <p className='text-gray-600 text-sm' id='standard-modal-description'>
            {props.confirmation}
          </p>
        </div>

        <div className='flex justify-end items-center p-3 bg-gray-50 border-t border-gray-200 space-x-2'>
          <button
            onClick={() => {
              closeModal();
            }}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          >
            Нет
          </button>
          <button
            onClick={() => {
              closeModal();
              props.onConfirm?.();
            }}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Да
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
