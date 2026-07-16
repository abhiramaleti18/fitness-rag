import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../api/api';
import './Profile.css';
import ConfirmModal from '../components/ConfirmModal';
import ConsistencyHeatmap from '../components/ConsistencyHeatmap';
import { PRESET_COLORS, saveAccentColor, resetAccentColor, getSavedAccentColor } from '../utils/theme';

const GOALS = ['muscle gain', 'strength', 'fat loss', 'endurance', 'mobility'];
const EQUIPMENT = ['bodyweight', 'dumbbells', 'barbell', 'resistance bands', 'pull-up bar', 'full gym'];
const INJURIES = ['shoulder pain', 'lower back pain', 'knee pain', 'elbow pain', 'wrist pain', 'limited overhead mobility'];

export default function Profile() {
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [personalRecords, setPersonalRecords] = useState([]);
    const [loadingRecords, setLoadingRecords] = useState(true);
    const [accentColor, setAccentColor] = useState(getSavedAccentColor());
    const [user, setUser] = useState(null);
    const [form, setForm] = useState({ weight: '', height: '', experienceLevel: 'beginner' });
    const [goals, setGoals] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [injuries, setInjuries] = useState([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [prForm, setPrForm] = useState({ exerciseName: '', weight: '', reps: '' });
    const [prError, setPrError] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

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
            setInjuries(u.injuries || []);
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
            equipmentAccess: equipment,
            injuries: injuries
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

    useEffect(() => {
        api.get('/logs/personal-records')
            .then(res => setPersonalRecords(res.data.records || []))
            .catch(err => console.error('Failed to load personal records', err))
            .finally(() => setLoadingRecords(false));
    }, []);
    const handleAccentChange = (hex) => {
        setAccentColor(hex);
        saveAccentColor(hex);
    };

    const handleAccentReset = () => {
        resetAccentColor();
        setAccentColor(getSavedAccentColor());
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
                <button className="profile-logout-btn" onClick={handleLogout}>Log out</button>
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

                            <label>Injuries & Pain Constraints</label>
                            <div className="chip-group">
                                {INJURIES.map(i => (
                                    <button type="button" key={i} className={`chip ${injuries.includes(i) ? 'chip-active' : ''}`} onClick={() => toggle(injuries, setInjuries, i)}>
                                        {i}
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
                        <p className="profile-appearance-sub">Automatically updated from your logged workouts.</p>

                        <div className="pr-list">
                            {loadingRecords && <p className="profile-empty">Loading...</p>}

                            {!loadingRecords && personalRecords.length === 0 && (
                                <p className="profile-empty">No records yet — log a workout and your best lifts will show up here.</p>
                            )}

                            {!loadingRecords && personalRecords.map((pr) => (
                                <div key={pr.exerciseName} className="pr-item">
                                    <div>
                                        <strong>{pr.exerciseName}</strong>
                                        <span className="pr-item-detail">
                                            {pr.weight}kg &times; {pr.reps} &middot; est. 1RM {pr.oneRepMax}kg
                                        </span>
                                    </div>
                                    <span className="pr-item-date">{new Date(pr.date).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="profile-card">
                        <h2>Appearance</h2>
                        <p className="profile-appearance-sub">Pick an accent color for the app.</p>

                        <div className="accent-swatches">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    className={`accent-swatch ${accentColor.toLowerCase() === c.value.toLowerCase() ? 'accent-swatch-active' : ''}`}
                                    style={{ background: c.value }}
                                    onClick={() => handleAccentChange(c.value)}
                                    aria-label={c.name}
                                    title={c.name}
                                />
                            ))}

                            <label className="accent-swatch accent-swatch-custom" title="Custom color">
                                <input
                                    type="color"
                                    value={accentColor}
                                    onChange={(e) => handleAccentChange(e.target.value)}
                                />
                            </label>
                        </div>

                        <button type="button" className="accent-reset" onClick={handleAccentReset}>
                            Reset to default
                        </button>
                    </div>
                </div>
            </div>
            </Layout>
    );
}