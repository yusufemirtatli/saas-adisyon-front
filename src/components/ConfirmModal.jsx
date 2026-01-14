const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Emin misiniz?",
  message = "Bu işlemi geri alamazsınız.",
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  confirmButtonClass = "bg-red-500 hover:bg-red-600",
  icon = "warning"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const iconConfig = {
    warning: {
      iconClass: "text-orange-500",
      bgClass: "bg-orange-100 dark:bg-orange-900/30",
      iconName: "warning"
    },
    danger: {
      iconClass: "text-red-500",
      bgClass: "bg-red-100 dark:bg-red-900/30",
      iconName: "error"
    },
    info: {
      iconClass: "text-blue-500",
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      iconName: "info"
    },
    success: {
      iconClass: "text-green-500",
      bgClass: "bg-green-100 dark:bg-green-900/30",
      iconName: "check_circle"
    }
  };

  const currentIcon = iconConfig[icon] || iconConfig.warning;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-[#1a2632] w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className={`size-16 rounded-full ${currentIcon.bgClass} flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-4xl ${currentIcon.iconClass}`}>
                {currentIcon.iconName}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-center mb-2 text-[#0d141b] dark:text-white">
            {title}
          </h3>

          {/* Message */}
          <p className="text-center text-[#4c739a] dark:text-gray-400 mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-[#e7edf3] dark:border-slate-700 text-[#4c739a] dark:text-gray-400 rounded-lg font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 text-white py-2.5 rounded-lg font-medium text-sm transition-all ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ConfirmModal;
