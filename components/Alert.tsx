import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface AlertProps {
    alert: { type: 'success' | 'error'; message: string } | null;
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ alert, onClose }) => {
    if (!alert) return null;

    const isSuccess = alert.type === 'success';

    return (
        <div className={`rounded-md p-4 mb-4 flex items-start justify-between ${isSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    {isSuccess ? (
                        <CheckCircle className={`h-5 w-5 ${isSuccess ? 'text-green-400' : 'text-red-400'}`} aria-hidden="true" />
                    ) : (
                        <AlertCircle className={`h-5 w-5 ${isSuccess ? 'text-green-400' : 'text-red-400'}`} aria-hidden="true" />
                    )}
                </div>
                <div className="ml-3">
                    <p className="text-sm font-medium">{alert.message}</p>
                </div>
            </div>
            <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSuccess ? 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600' : 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'}`}
                    >
                        <span className="sr-only">Dismiss</span>
                        <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Alert;
