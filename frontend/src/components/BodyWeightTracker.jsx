import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/api';
import './BodyWeightTracker.css';

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function BodyWeightTracker() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weightInput, setWeightInput] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadEntries = () => {
        api.get('/bodyweight')
            .then(res => setEntries(res.data.entries || []))
            .catch(() => setError('Failed to load body weight history.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadEntries(); }, []);

    const handleLog = async (e) => {
        e.preventDefault();
        if (!weightInput || Number(weightInput) <= 0) {
            setError('Enter a valid weight.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            await api.post('/bodyweight', { weight: Number(weightInput) });
            setWeightInput('');
            loadEntries();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to log weight.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/bodyweight/${id}`);
            setEntries(entries.filter(e => e._id !== id));
        } catch (err) {
            console.error('Failed to delete entry', err);
        }
    };

    const chartData = entries.map(e => ({ date: formatDate(e.date), weight: e.weight }));
    const latest = entries.length > 0 ? entries[entries.length - 1] : null;
    const recent = entries.slice(-5).reverse();

    return (
        <div className="bw-card">
            <div className="bw-header">
                <h3>Body Weight</h3>
                {latest && <span className="bw-latest">{latest.weight}kg latest</span>}
            </div>

            <form className="bw-log-form" onSubmit={handleLog}>
                <input
                    type="number"
                    step="0.1"
                    placeholder="Weight (kg)"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                />
                <button type="submit" disabled={saving}>{saving ? 'Logging...' : 'Log'}</button>
            </form>

            {error && <p className="bw-error">{error}</p>}

            {loading && <p className="bw-loading">Loading...</p>}

            {!loading && chartData.length === 0 && (
                <p className="bw-empty-hint">No entries yet — log your weight above to start tracking.</p>
            )}

            {!loading && chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', borderRadius: 8 }}
                            labelStyle={{ color: 'var(--text)' }}
                        />
                        <Line type="monotone" dataKey="weight" stroke="var(--red)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}

            {recent.length > 0 && (
                <div className="bw-recent-list">
                    {recent.map((e) => (
                        <div key={e._id} className="bw-recent-item">
                            <span>{formatDate(e.date)}</span>
                            <span>{e.weight}kg</span>
                            <button onClick={() => handleDelete(e._id)} aria-label="Delete entry">&times;</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}