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
            colors = 'bg-emerald-50/80 backdrop-blur-md text-emerald-800 border-emerald-200/60 shadow-lg shadow-emerald-500/10';
            Icon = CheckCircle;
            break;
        case 'error':
            colors = 'bg-red-50/80 backdrop-blur-md text-red-800 border-red-200/60 shadow-lg shadow-red-500/10';
            Icon = AlertCircle;
            break;
        case 'warning':
            colors = 'bg-amber-50/80 backdrop-blur-md text-amber-800 border-amber-200/60 shadow-lg shadow-amber-500/10';
            Icon = AlertTriangle;
            break;
        case 'info':
        default:
            colors = 'bg-blue-50/80 backdrop-blur-md text-blue-800 border-blue-200/60 shadow-lg shadow-blue-500/10';
            Icon = Info;
            break;
    }

    return (
        <div className={`rounded-xl p-4 mb-6 flex items-start justify-between border ${colors} animate-fade-in-up relative overflow-hidden`}>
            {/* Glass Shine Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] animate-shine pointer-events-none"></div>

            <div className="flex gap-4 relative z-10">
                <div className="flex-shrink-0 mt-0.5 p-2 bg-white/40 rounded-full border border-white/20 shadow-sm">
                    <Icon className="h-5 w-5 opacity-90" aria-hidden="true" />
                </div>
                <div>
                    <h3 className="text-sm font-bold tracking-wide uppercase opacity-80 mb-0.5">{alert.type}</h3>
                    <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
                </div>
            </div>
            <div className="ml-auto pl-3 relative z-10">
                <button
                    type="button"
                    onClick={onClose}
                    className={`inline-flex rounded-lg p-2 focus:outline-none transition-all hover:bg-white/30 hover:shadow-sm active:scale-95`}
                >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};

export default Alert;
