import { X, AlertTriangle } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    description = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger"
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-black/50 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/10' : 'bg-blue-500/10'
                            }`}>
                            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-red-500' : 'text-blue-500'
                                }`} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    {description}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-medium"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${variant === 'danger'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
