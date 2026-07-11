import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/api';
import './Logs.css';

function emptyExercise() {
    return { exerciseName: '', sets: [{ setNumber: 1, reps: '', weight: '', repsHint: '' }], notes: '' };
}

function prefillFromSplitDay(splitExercises) {
    return splitExercises.map(ex => {
        const setCount = parseInt(ex.prescription?.sets, 10) || 1;
        const repsHint = ex.prescription?.reps || '';
        return {
            exerciseName: ex.exerciseName,
            notes: '',
            sets: Array.from({ length: setCount }, (_, i) => ({
                setNumber: i + 1,
                reps: '',
                weight: '',
                repsHint
            }))
        };
    });
}

export default function Logs() {
    const location = useLocation();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [dayLabel, setDayLabel] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [exercises, setExercises] = useState(() => {
        if (location.state?.exercises?.length) {
            return prefillFromSplitDay(location.state.exercises);
        }
        return [emptyExercise()];
    });

    useEffect(() => {
        if (location.state?.dayLabel) {
            setDayLabel(location.state.dayLabel);
        }
        if (location.state) {
            window.history.replaceState({}, document.title);
        }
    }, []);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const [activeSuggestBox, setActiveSuggestBox] = useState(null); // index of exercise being autocompleted
    const [suggestions, setSuggestions] = useState([]);

    const [pendingDelete, setPendingDelete] = useState(null);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/logs');
            setLogs(res.data.logs || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load workout history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadLogs(); }, []);

    const updateExercise = (index, field, value) => {
        const next = [...exercises];
        next[index] = { ...next[index], [field]: value };
        setExercises(next);
    };

    const handleNameChange = async (index, value) => {
        updateExercise(index, 'exerciseName', value);
        if (value.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await api.get('/ai/exercises', { params: { name: value, limit: 6 } });
            setSuggestions(res.data.results || []);
            setActiveSuggestBox(index);
        } catch (err) {
            console.error('Autocomplete failed', err);
        }
    };

    const updateSet = (exIndex, setIndex, field, value) => {
        const next = [...exercises];
        const sets = [...next[exIndex].sets];
        sets[setIndex] = { ...sets[setIndex], [field]: value };
        next[exIndex] = { ...next[exIndex], sets };
        setExercises(next);
    };

    const addSet = (exIndex) => {
        const next = [...exercises];
        const sets = next[exIndex].sets;
        sets.push({ setNumber: sets.length + 1, reps: '', weight: '' });
        setExercises(next);
    };

    const removeSet = (exIndex, setIndex) => {
        const next = [...exercises];
        next[exIndex].sets = next[exIndex].sets.filter((_, i) => i !== setIndex);
        setExercises(next);
    };

    const addExercise = () => setExercises([...exercises, emptyExercise()]);

    const removeExercise = (index) => {
        setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveError('');

        const cleaned = exercises
            .filter(ex => ex.exerciseName.trim())
            .map(ex => ({
                exerciseName: ex.exerciseName.trim(),
                notes: ex.notes,
                sets: ex.sets
                    .filter(s => s.reps !== '')
                    .map((s, i) => ({
                        setNumber: i + 1,
                        reps: Number(s.reps),
                        weight: s.weight ? Number(s.weight) : 0
                    }))
            }))
            .filter(ex => ex.sets.length > 0);

        if (cleaned.length === 0) {
            setSaveError('Log at least one exercise with a rep count.');
            return;
        }

        setSaving(true);
        try {
            await api.post('/logs', { date, dayLabel, exercises: cleaned });
            setDayLabel('');
            setExercises([emptyExercise()]);
            loadLogs();
        } catch (err) {
            setSaveError(err.response?.data?.message || 'Failed to save workout');
        } finally {
            setSaving(false);
        }
    };

    const confirmDeleteLog = async () => {
        if (!pendingDelete) return;
        try {
            await api.delete(`/logs/${pendingDelete}`);
            setLogs(logs.filter(l => l._id !== pendingDelete));
        } catch (err) {
            console.error('Failed to delete log', err);
        } finally {
            setPendingDelete(null);
        }
    };

    return (
        <Layout>
            <div className="logs-page">
                <h1 className="logs-title">My Workouts</h1>
                <p className="logs-sub">Log today's session and track how your lifts progress over time.</p>

                <form onSubmit={handleSubmit} className="logs-form">
                    <div className="logs-form-header">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="logs-date-input"
                        />
                        <input
                            type="text"
                            placeholder="Day label (e.g. Push Day, Monday Chest)"
                            value={dayLabel}
                            onChange={(e) => setDayLabel(e.target.value)}
                            className="logs-label-input"
                        />
                    </div>

                    {saveError && <p className="logs-error">{saveError}</p>}

                    {exercises.map((ex, exIndex) => (
                        <div key={exIndex} className="logs-exercise-block">
                            <div className="logs-exercise-header">
                                <div className="pr-autocomplete">
                                    <input
                                        placeholder="Exercise name"
                                        value={ex.exerciseName}
                                        onChange={(e) => handleNameChange(exIndex, e.target.value)}
                                        onFocus={() => ex.exerciseName.length >= 2 && setActiveSuggestBox(exIndex)}
                                        onBlur={() => setTimeout(() => setActiveSuggestBox(null), 150)}
                                        className="logs-exercise-name-input"
                                    />
                                    {activeSuggestBox === exIndex && suggestions.length > 0 && (
                                        <div className="pr-suggestions">
                                            {suggestions.map((s) => (
                                                <button
                                                    key={s.id}
                                                    type="button"
                                                    className="pr-suggestion-item"
                                                    onMouseDown={() => {
                                                        updateExercise(exIndex, 'exerciseName', s.name);
                                                        setActiveSuggestBox(null);
                                                    }}
                                                >
                                                    {s.name}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {exercises.length > 1 && (
                                    <button type="button" className="logs-remove-exercise" onClick={() => removeExercise(exIndex)}>
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="logs-sets">
                                {ex.sets.map((set, setIndex) => (
                                    <div key={setIndex} className="logs-set-row">
                                        <span className="logs-set-number">Set {setIndex + 1}</span>
                                        <input
                                            type="number"
                                            placeholder={set.repsHint ? `Reps (target: ${set.repsHint})` : 'Reps'}
                                            value={set.reps}
                                            onChange={(e) => updateSet(exIndex, setIndex, 'reps', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            step="0.5"
                                            placeholder="Weight (kg)"
                                            value={set.weight}
                                            onChange={(e) => updateSet(exIndex, setIndex, 'weight', e.target.value)}
                                        />
                                        {ex.sets.length > 1 && (
                                            <button type="button" className="logs-remove-set" onClick={() => removeSet(exIndex, setIndex)}>&times;</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="logs-add-set" onClick={() => addSet(exIndex)}>+ Add set</button>
                            </div>
                        </div>
                    ))}

                    <button type="button" className="logs-add-exercise" onClick={addExercise}>+ Add another exercise</button>

                    <button type="submit" className="logs-save" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Workout'}
                    </button>
                </form>

                <div className="logs-history">
                    <h2>History</h2>

                    {loading && <p className="logs-loading">Loading...</p>}
                    {error && <p className="logs-error">{error}</p>}
                    {!loading && logs.length === 0 && <p className="logs-empty">No workouts logged yet.</p>}

                    {logs.map((log) => (
                        <div key={log._id} className="logs-history-card">
                            <div className="logs-history-header">
                                <div>
                                    <strong>{log.dayLabel || 'Workout'}</strong>
                                    <span className="logs-history-date">
                                        {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <button className="logs-history-delete" onClick={() => setPendingDelete(log._id)} aria-label="Delete workout">&times;</button>
                            </div>

                            <div className="logs-history-exercises">
                                {log.exercises.map((ex, i) => (
                                    <div key={i} className="logs-history-exercise">
                                        <span className="logs-history-exercise-name">{ex.exerciseName}</span>
                                        <span className="logs-history-sets">
                                            {ex.sets.map((s, j) => (
                                                <span key={j} className="logs-history-set">
                                                    {s.reps}{s.weight > 0 ? ` × ${s.weight}kg` : ''}
                                                </span>
                                            ))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmModal
                open={!!pendingDelete}
                title="Delete this workout?"
                message="This will permanently remove the entire logged session."
                onConfirm={confirmDeleteLog}
                onCancel={() => setPendingDelete(null)}
            />
        </Layout>
    );
}