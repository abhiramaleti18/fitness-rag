import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import './Profile.css';
import ConfirmModal from '../components/ConfirmModal';
import ConsistencyHeatmap from '../components/ConsistencyHeatmap';

const GOALS = ['muscle gain', 'strength', 'fat loss', 'endurance', 'mobility'];
const EQUIPMENT = ['bodyweight', 'dumbbells', 'barbell', 'resistance bands', 'pull-up bar', 'full gym'];

export default function Profile() {
    const [editing, setEditing] = useState(false);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ weight: '', height: '', experienceLevel: 'beginner' });
    const [goals, setGoals] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [prForm, setPrForm] = useState({ exerciseName: '', weight: '', reps: '' });
    const [prError, setPrError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const loadProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            const u = res.data.user;
            setUser(u);
            setForm({
                weight: u.weight ?? '',
                height: u.height ?? '',
                experienceLevel: u.experienceLevel || 'beginner'
            });
            setGoals(u.fitnessGoals || []);
            setEquipment(u.equipmentAccess || []);
        } catch (err) {
            console.error('Failed to load profile', err);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    const toggle = (list, setList, item) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
        const res = await api.put('/profile', {
            weight: form.weight ? Number(form.weight) : null,
            height: form.height ? Number(form.height) : null,
            experienceLevel: form.experienceLevel,
            fitnessGoals: goals,
            equipmentAccess: equipment
        });
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user')), ...res.data.user }));
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2500);
    } catch (err) {
        console.error('Failed to save profile', err);
    } finally {
        setSaving(false);
    }
};

    const handleExerciseNameChange = async (value) => {
        setPrForm({ ...prForm, exerciseName: value });

        if (value.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await api.get('/ai/exercises', { params: { name: value, limit: 6 } });
            setSuggestions(res.data.results || []);
            setShowSuggestions(true);
        } catch (err) {
            console.error('Autocomplete failed', err);
        }
    };

    const handleAddPR = async (e) => {
        e.preventDefault();
        setPrError('');

        if (!prForm.exerciseName || !prForm.weight) {
            setPrError('Exercise name and weight are required');
            return;
        }

        try {
            const res = await api.post('/profile/records', {
                exerciseName: prForm.exerciseName,
                weight: Number(prForm.weight),
                reps: prForm.reps ? Number(prForm.reps) : 1
            });
            setUser({ ...user, personalRecords: res.data.personalRecords });
            setPrForm({ exerciseName: '', weight: '', reps: '' });
            setSuggestions([]);
        } catch (err) {
            setPrError(err.response?.data?.message || 'Failed to add record');
        }
    };

    const confirmDeletePR = async () => {
        if (!pendingDelete) return;
        try {
            const res = await api.delete(`/profile/records/${pendingDelete.id}`);
            setUser({ ...user, personalRecords: res.data.personalRecords });
        } catch (err) {
            console.error('Failed to delete record', err);
        } finally {
            setPendingDelete(null);
        }
    };

    if (!user) {
        return (
            <Layout>
                <div className="profile-page"><p className="profile-loading">Loading profile...</p></div>
            </Layout>
        );
    }

    const bmi = form.weight && form.height
        ? (Number(form.weight) / ((Number(form.height) / 100) ** 2)).toFixed(1)
        : null;

    return (
        <Layout>
            <div className="profile-page">
                <h1 className="profile-title">Your Profile</h1>
                <p className="profile-sub">Body stats and equipment help FitBot tailor what it recommends.</p>
                <ConsistencyHeatmap />
                <div className="profile-grid">
                    <form onSubmit={handleSaveProfile} className="profile-card">
                        <div className="profile-card-header">
                            <h2>Body & Preferences</h2>
                            <button
                                type="button"
                                className="profile-edit-toggle"
                                onClick={() => setEditing(!editing)}
                            >
                                {editing ? 'Cancel' : 'Edit'}
                            </button>
                        </div>

                        <fieldset disabled={!editing} className="profile-fieldset">
                            <div className="profile-row">
                                <div>
                                    <label>Weight (kg)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.weight}
                                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>Height (cm)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={form.height}
                                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                                    />
                                </div>
                            </div>

                            {bmi && <p className="profile-bmi">BMI: <strong>{bmi}</strong></p>}

                            <label>Experience level</label>
                            <select
                                value={form.experienceLevel}
                                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>

                            <label>Goals</label>
                            <div className="chip-group">
                                {GOALS.map(g => (
                                    <button type="button" key={g} className={`chip ${goals.includes(g) ? 'chip-active' : ''}`} onClick={() => toggle(goals, setGoals, g)}>
                                        {g}
                                    </button>
                                ))}
                            </div>

                            <label>Equipment access</label>
                            <div className="chip-group">
                                {EQUIPMENT.map(e => (
                                    <button type="button" key={e} className={`chip ${equipment.includes(e) ? 'chip-active' : ''}`} onClick={() => toggle(equipment, setEquipment, e)}>
                                        {e}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        {editing && (
                            <button type="submit" className="profile-save" disabled={saving}>
                                {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save changes'}
                            </button>
                        )}
                    </form>

                    <div className="profile-card">
                        <h2>Personal Records</h2>

                        <form onSubmit={handleAddPR} className="pr-form">
                            {prError && <p className="profile-error">{prError}</p>}

                            <div className="pr-autocomplete">
                                <input
                                    placeholder="Exercise (e.g. Bench Press)"
                                    value={prForm.exerciseName}
                                    onChange={(e) => handleExerciseNameChange(e.target.value)}
                                    onFocus={() => prForm.exerciseName.length >= 2 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="pr-suggestions">
                                        {suggestions.map((ex) => (
                                            <button
                                                key={ex.id}
                                                type="button"
                                                className="pr-suggestion-item"
                                                onMouseDown={() => {
                                                    setPrForm({ ...prForm, exerciseName: ex.name });
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {ex.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pr-form-row">
                                <input
                                    type="number"
                                    step="0.5"
                                    placeholder="Weight (kg)"
                                    value={prForm.weight}
                                    onChange={(e) => setPrForm({ ...prForm, weight: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Reps"
                                    value={prForm.reps}
                                    onChange={(e) => setPrForm({ ...prForm, reps: e.target.value })}
                                />
                                <button type="submit">Add</button>
                            </div>
                        </form>

                        <div className="pr-list">
                            {(!user.personalRecords || user.personalRecords.length === 0) && (
                                <p className="profile-empty">No personal records yet — add your first lift above.</p>
                            )}
                            {user.personalRecords?.slice().reverse().map((pr) => (
                                <div key={pr._id} className="pr-item">
                                    <div>
                                        <strong>{pr.exerciseName}</strong>
                                        <span className="pr-item-detail">{pr.weight}kg &times; {pr.reps}</span>
                                    </div>
                                    <button onClick={() => setPendingDelete({ id: pr._id, name: pr.exerciseName })} className="pr-delete" aria-label="Delete record">&times;</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmModal
                open={!!pendingDelete}
                title="Delete personal record?"
                message={pendingDelete ? `This will permanently remove your record for "${pendingDelete.name}".` : ''}
                onConfirm={confirmDeletePR}
                onCancel={() => setPendingDelete(null)}
            />
        </Layout>
    );
}