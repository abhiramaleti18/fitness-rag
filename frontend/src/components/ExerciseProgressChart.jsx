import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import './ExerciseProgressChart.css';

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ExerciseProgressChart() {
    const [exerciseNames, setExerciseNames] = useState([]);
    const [selected, setSelected] = useState('');
    const [chartData, setChartData] = useState([]);
    const [loadingNames, setLoadingNames] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(false);
    const [error, setError] = useState('');
    const [suggestion, setSuggestion] = useState(null);

    useEffect(() => {
        api.get('/logs/exercise-names')
            .then(res => {
                const names = res.data.names || [];
                setExerciseNames(names);
                if (names.length > 0) setSelected(names[0]);
            })
            .catch(() => setError('Failed to load your logged exercises.'))
            .finally(() => setLoadingNames(false));
    }, []);

    useEffect(() => {
        if (!selected) return;
        setLoadingProgress(true);
        setError('');
        setSuggestion(null);

        api.get(`/logs/progress/${encodeURIComponent(selected)}`)
            .then(res => {
                const points = (res.data.progress || []).map(p => ({
                    date: formatDate(p.date),
                    weight: p.topSet?.weight ?? 0,
                    reps: p.topSet?.reps ?? 0
                }));
                setChartData(points);
            })
            .catch(() => setError('Failed to load progress for this exercise.'))
            .finally(() => setLoadingProgress(false));

        api.get(`/logs/suggestion/${encodeURIComponent(selected)}`)
            .then(res => setSuggestion(res.data.suggestion ? res.data : null))
            .catch(() => setSuggestion(null));
    }, [selected]);

    if (loadingNames) {
        return <p className="progress-chart-loading">Loading your progress...</p>;
    }

    if (exerciseNames.length === 0) {
        return (
            <div className="progress-chart-empty">
                <p>No logged exercises yet.</p>
                <p className="progress-chart-empty-hint">Log a few workouts and your progress will show up here.</p>
            </div>
        );
    }

    return (
        <div className="progress-chart-card">
            <div className="progress-chart-header">
                <h3>Progress</h3>
                <select
                    className="progress-chart-select"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                >
                    {exerciseNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                </select>
            </div>

            {error && <p className="progress-chart-error">{error}</p>}

            {!error && loadingProgress && <p className="progress-chart-loading">Loading...</p>}

            {!error && !loadingProgress && chartData.length === 0 && (
                <p className="progress-chart-empty-hint">No logs found for this exercise yet.</p>
            )}

            {!error && !loadingProgress && chartData.length > 0 && (
                <>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8 }}
                                labelStyle={{ color: 'var(--text)' }}
                                formatter={(value, name) => [value, name === 'weight' ? 'Top set weight' : 'Reps']}
                            />
                            <Line type="monotone" dataKey="weight" stroke="var(--red)" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                    <p className="progress-chart-note">Showing top-set weight per session for {selected}.</p>
                </>
            )}

            {suggestion && (
                <div className="progress-chart-suggestion">
                    <span className="progress-chart-suggestion-label">Next session suggestion</span>
                    <p className="progress-chart-suggestion-target">
                        {suggestion.suggestion.weight > 0 ? `${suggestion.suggestion.weight}kg × ` : ''}
                        {suggestion.suggestion.reps} reps
                    </p>
                    <p className="progress-chart-suggestion-rationale">{suggestion.rationale}</p>
                </div>
            )}
        </div>
    );
}