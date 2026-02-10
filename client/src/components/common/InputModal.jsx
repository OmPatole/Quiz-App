import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const InputModal = ({
    isOpen,
    onClose,
    onSubmit,
    title = "Input",
    placeholder = "Type here...",
    initialValue = "",
    confirmText = "Create",
    cancelText = "Cancel"
}) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
            // Auto-focus with a slight delay to ensure render
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(value);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={value || ''}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={placeholder}
                        className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-300 dark:border-neutral-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors mb-6"
                    />

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="submit"
                            disabled={!value.trim()}
                            className="bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white dark:text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-blue-500/20 dark:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {confirmText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InputModal;
