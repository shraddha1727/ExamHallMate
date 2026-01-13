import React from 'react';
import { AlertCircle, CheckCircle, X, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
    alert: { type: 'success' | 'error' | 'info' | 'warning'; message: string } | null;
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ alert, onClose }) => {
    if (!alert) return null;

    let colors = '';
    let Icon = Info;

    switch (alert.type) {
        case 'success':
            colors = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            Icon = CheckCircle;
            break;
        case 'error':
            colors = 'bg-red-50 text-red-800 border-red-200';
            Icon = AlertCircle;
            break;
        case 'warning':
            colors = 'bg-amber-50 text-amber-800 border-amber-200';
            Icon = AlertTriangle;
            break;
        case 'info':
        default:
            colors = 'bg-blue-50 text-blue-800 border-blue-200';
            Icon = Info;
            break;
    }

    return (
        <div className={`rounded-lg p-4 mb-4 flex items-start justify-between border shadow-sm ${colors} animate-fade-in-up`}>
            <div className="flex gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <Icon className="h-5 w-5 opacity-90" aria-hidden="true" />
                </div>
                <div>
                    <p className="text-sm font-bold">{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</p>
                    <p className="text-sm opacity-90">{alert.message}</p>
                </div>
            </div>
            <div className="ml-auto pl-3">
                <button
                    type="button"
                    onClick={onClose}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none transition-colors opacity-70 hover:opacity-100`}
                >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

export default Alert;
