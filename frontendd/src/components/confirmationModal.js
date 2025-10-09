// src/components/ConfirmationModal.js
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Enhanced ConfirmationModal with more types
export const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // 'danger', 'warning', 'info', 'success'
  isLoading = false
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />,
      confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      iconBackground: "bg-red-100 dark:bg-red-900/50"
    },
    warning: {
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />,
      confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      iconBackground: "bg-yellow-100 dark:bg-yellow-900/50"
    },
    info: {
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-blue-600" />,
      confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      iconBackground: "bg-blue-100 dark:bg-blue-900/50"
    },
    success: {
      icon: <ExclamationTriangleIcon className="w-6 h-6 text-green-600" />,
      confirmButton: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
      iconBackground: "bg-green-100 dark:bg-green-900/50"
    }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.iconBackground}`}>
              {config.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          {!isLoading && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          {!isLoading && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.confirmButton} transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};