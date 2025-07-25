import React from 'react';

export default function LiveClock() {
    const [time, setTime] = React.useState(new Date());

    React.useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const formatTime = (date) => {
        // This would be the place to check for user's 12/24 hour preference from settings
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    const formatDate = (date) => {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return (
        <div className="text-center bg-black/30 px-4 py-1 rounded-lg border border-slate-700/50">
            <div className="text-xl font-bold font-mono text-white tracking-wider">
                {formatTime(time)}
            </div>
            <div className="text-xs text-slate-400">
                {formatDate(time)}
            </div>
        </div>
    );
}