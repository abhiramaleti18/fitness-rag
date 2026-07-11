import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ExerciseSearchInput from '../components/ExerciseSearchInput';
import api from '../api/api';
import './CustomSplitBuilder.css';

function emptyDay(dayNumber) {
    return { dayNumber, focus: '', exercises: [] };
}

export default function CustomSplitBuilder() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [days, setDays] = useState([emptyDay(1)]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [savedSplit, setSavedSplit] = useState(null);

    const updateDayFocus = (dayIndex, focus) => {
        const next = [...days];
        next[dayIndex] = { ...next[dayIndex], focus };
        setDays(next);
    };

    const addDay = () => {
        setDays([...days, emptyDay(days.length + 1)]);
    };

    const removeDay = (dayIndex) => {
        const next = days.filter((_, i) => i !== dayIndex)
            .map((d, i) => ({ ...d, dayNumber: i + 1 }));
        setDays(next.length ? next : [emptyDay(1)]);
    };

    const addExerciseToDay = (dayIndex, exercise) => {
        const next = [...days];
        const alreadyAdded = next[dayIndex].exercises.some(e => e.exerciseName === exercise.name);
        if (alreadyAdded) return;

        next[dayIndex] = {
            ...next[dayIndex],
            exercises: [
                ...next[dayIndex].exercises,
                {
                    exerciseName: exercise.name,
                    movementPattern: exercise.movementPattern,
                    sets: '',
                    reps: '',
                    rest: ''
                }
            ]
        };
        setDays(next);
    };

    const removeExercise = (dayIndex, exIndex) => {
        const next = [...days];
        next[dayIndex] = {
            ...next[dayIndex],
            exercises: next[dayIndex].exercises.filter((_, i) => i !== exIndex)
        };
        setDays(next);
    };

    const updateExerciseField = (dayIndex, exIndex, field, value) => {
        const next = [...days];
        const exercises = [...next[dayIndex].exercises];
        exercises[exIndex] = { ...exercises[exIndex], [field]: value };
        next[dayIndex] = { ...next[dayIndex], exercises };
        setDays(next);
    };

    const canSave = name.trim() && days.some(d => d.exercises.length > 0);

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        setError('');

        try {
            const payload = {
                name: name.trim(),
                isCustom: true,
                days: days
                    .filter(d => d.exercises.length > 0)
                    .map(d => ({
                        dayNumber: d.dayNumber,
                        focus: d.focus.trim() || `Day ${d.dayNumber}`,
                        warmup: [],
                        exercises: d.exercises.map(ex => ({
                            exerciseName: ex.exerciseName,
                            prescription: {
                                sets: ex.sets || '',
                                reps: ex.reps || '',
                                rest: ex.rest || ''
                            },
                            howItWorks: '',
                            movementPattern: ex.movementPattern || ''
                        }))
                    }))
            };

            const res = await api.post('/splits', payload);
            setSavedSplit(res.data.split);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save split.');
        } finally {
            setSaving(false);
        }
    };

    if (savedSplit) {
        return (
            <Layout>
                <div className="csb-page">
                    <div className="csb-saved">
                        <h1>Split saved!</h1>
                        <p className="csb-saved-name">"{savedSplit.name}" is ready.</p>

                        {savedSplit.aiReport?.text ? (
                            <div className="csb-report">
                                <h2>FitBot's Analysis</h2>
                                <p>{savedSplit.aiReport.text}</p>
                            </div>
                        ) : (
                            <p className="csb-no-report">
                                Analysis wasn't generated for this split — you can still view and log it normally.
                            </p>
                        )}

                        <div className="csb-saved-actions">
                            <button className="csb-primary-btn" onClick={() => navigate(`/splits/${savedSplit._id}`)}>
                                View Split
                            </button>
                            <button className="csb-secondary-btn" onClick={() => navigate('/splits')}>
                                Back to My Workout Splits
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="csb-page">
                <h1>Create Custom Split</h1>
                <p className="csb-sub">Build your own split day by day. FitBot will analyze it once you save.</p>

                <input
                    type="text"
                    className="csb-name-input"
                    placeholder="Name this split (e.g. My Push Pull Legs)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {days.map((day, dayIndex) => (
                    <div key={dayIndex} className="csb-day">
                        <div className="csb-day-header">
                            <input
                                type="text"
                                className="csb-day-focus-input"
                                placeholder={`Day ${day.dayNumber} label (e.g. Push Day)`}
                                value={day.focus}
                                onChange={(e) => updateDayFocus(dayIndex, e.target.value)}
                            />
                            {days.length > 1 && (
                                <button className="csb-day-remove" onClick={() => removeDay(dayIndex)}>
                                    Remove Day
                                </button>
                            )}
                        </div>

                        <div className="csb-exercise-list">
                            {day.exercises.map((ex, exIndex) => (
                                <div key={exIndex} className="csb-exercise-row">
                                    <span className="csb-exercise-name">{ex.exerciseName}</span>
                                    <input
                                        type="text"
                                        className="csb-small-input"
                                        placeholder="Sets"
                                        value={ex.sets}
                                        onChange={(e) => updateExerciseField(dayIndex, exIndex, 'sets', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="csb-small-input"
                                        placeholder="Reps"
                                        value={ex.reps}
                                        onChange={(e) => updateExerciseField(dayIndex, exIndex, 'reps', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        className="csb-small-input"
                                        placeholder="Rest"
                                        value={ex.rest}
                                        onChange={(e) => updateExerciseField(dayIndex, exIndex, 'rest', e.target.value)}
                                    />
                                    <button className="csb-exercise-remove" onClick={() => removeExercise(dayIndex, exIndex)}>
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>

                        <ExerciseSearchInput
                            placeholder="Add an exercise to this day..."
                            onSelect={(exercise) => addExerciseToDay(dayIndex, exercise)}
                        />
                    </div>
                ))}

                <button className="csb-add-day-btn" onClick={addDay}>+ Add Another Day</button>

                {error && <p className="csb-error">{error}</p>}

                <div className="csb-save-row">
                    <button className="csb-primary-btn" onClick={handleSave} disabled={!canSave || saving}>
                        {saving ? 'Saving & analyzing...' : 'Save Split'}
                    </button>
                    <button className="csb-secondary-btn" onClick={() => navigate('/splits')} disabled={saving}>
                        Cancel
                    </button>
                </div>
            </div>
        </Layout>
    );
}   