import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-fade-in"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {children}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="button"
            className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md"
            onClick={onConfirm}
          >
            Xác nhận Xóa
          </button>
        </div>
      </div>
    </div>
  );
};
