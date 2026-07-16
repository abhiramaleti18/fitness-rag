import { useState, useEffect } from 'react';
import api from '../api/api';
import './WeeklySummary.css';

export default function WeeklySummary() {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/logs/weekly-summary')
            .then(res => setSummary(res.data))
            .catch(() => setSummary(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading || !summary) return null;

    return (
        <div className="weekly-summary">
            <div className="weekly-summary-stat">
                <span className="weekly-summary-value">{summary.workoutsThisWeek}</span>
                <span className="weekly-summary-label">Workouts this week</span>
            </div>
            <div className="weekly-summary-divider" />
            <div className="weekly-summary-stat">
                <span className="weekly-summary-value">
                    {summary.streak} {summary.streak === 1 ? 'day' : 'days'}
                </span>
                <span className="weekly-summary-label">Current streak</span>
            </div>
            <div className="weekly-summary-divider" />
            <div className="weekly-summary-stat">
                <span className="weekly-summary-value">{summary.totalVolume.toLocaleString()}kg</span>
                <span className="weekly-summary-label">Volume this week</span>
            </div>
        </div>
    );
}