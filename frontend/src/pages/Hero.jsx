import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import api from '../api/api';
import PlanDayCard from '../components/PlanDayCard';
import WeeklySummary from '../components/WeeklySummary';
import './Hero.css';

const PILLS = [
    { icon: '🎯', label: 'Personalized to You' },
    { icon: '📚', label: '873 Verified Exercises' },
    { icon: '🛡️', label: 'Safety-First Guidance' },
    { icon: '💪', label: 'Real Coaching Cues' },
];

const SUGGESTED = [
    'Best chest exercises for beginners with dumbbells',
    'Lower back friendly alternatives to deadlifts',
    'Bodyweight exercises for a home workout',
    'How do I fix my squat form?',
];

const WHY = [
    {
        title: 'Recommendations you can trust',
        desc: 'Every suggestion comes from a real, verified exercise library — never a guess, never made up.',
    },
    {
        title: 'Built-in safety checks',
        desc: 'FitBot flags injury risks and contraindications with every recommendation, so you train smart.',
    },
    {
        title: 'Matched to your setup',
        desc: 'Suggestions factor in your equipment access and experience level, so it actually fits what you can do today.',
    },
    {
        title: 'Coached, not just listed',
        desc: 'Every exercise comes with form cues and common mistakes to avoid — like having a coach explain it.',
    },
];

const PLAN_KEYWORDS = [
    'plan', 'schedule', 'program', 'routine', 'days a week', 'split',
    'push pull legs', 'ppl', 'upper lower', 'bro split', 'full body workout',
    'workout'
];

const PLAN_DAY_PATTERN = /\d+[\s-]*day/i;

const isPlanQuery = (q) => PLAN_KEYWORDS.some(kw => q.toLowerCase().includes(kw)) || PLAN_DAY_PATTERN.test(q);

const deriveSplitName = (q) => {
    const cleaned = q.replace(/\b\d+[\s-]*day\b/gi, '').replace(/\bwith no equipment\b/gi, '').trim();
    const words = cleaned.split(/\s+/).slice(0, 6);
    const title = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return title || 'My Workout Split';
};

export default function Hero() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [planResult, setPlanResult] = useState(null);
    const [error, setError] = useState('');
    const [userContext, setUserContext] = useState(null);
    const [lastQuery, setLastQuery] = useState('');
    const [savingSplit, setSavingSplit] = useState(false);
    const [splitName, setSplitName] = useState('');
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        if (!localStorage.getItem('token')) return;
        api.get('/auth/me')
            .then(res => {
                const u = res.data.user;
                setUserContext({
                    experienceLevel: u.experienceLevel,
                    equipmentAccess: u.equipmentAccess,
                    fitnessGoals: u.fitnessGoals,
                    weight: u.weight,
                    injuries: u.injuries
                });
            })
            .catch(err => console.error('Failed to load profile for AI context', err));
    }, []);

    const runQuery = async (query) => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        setPlanResult(null);
        setShowSaveForm(false);
        setSaveMessage('');
        setLastQuery(query);

        try {
            if (isPlanQuery(query)) {
                const res = await api.post('/ai/plan', { query, userContext });
                setPlanResult(res.data);
                setSplitName(deriveSplitName(query));
            } else {
                const res = await api.post('/ai/recommend', { query, top_k: 5, userContext });
                setResult(res.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const saveSplit = async () => {
        if (!splitName.trim() || !planResult) return;
        setSavingSplit(true);
        setSaveMessage('');

        try {
            const days = planResult.plan.map((day) => ({
                dayNumber: day.day,
                focus: day.focus,
                warmup: day.warmup || [],
                exercises: day.exercises.map((ex) => ({
                    exerciseName: ex.name,
                    prescription: ex.prescription,
                    howItWorks: ex.howItWorks,
                    movementPattern: ex.movementPattern
                }))
            }));

            await api.post('/splits', {
                name: splitName.trim(),
                sourceQuery: lastQuery,
                days
            });

            setSaveMessage('Saved! View it in My Workout Splits.');
            setShowSaveForm(false);
        } catch (err) {
            setSaveMessage(err.response?.data?.message || 'Failed to save split. Try again.');
        } finally {
            setSavingSplit(false);
        }
    };

    return (
        <Layout>
            <div className="hero-page">
                <div className="hero-banner">
                    <div className="hero-banner-overlay" />
                    <div className="hero-banner-content">
                        <h1 className="hero-title">
                            Your <span>AI</span> Fitness Coach
                        </h1>
                        <p className="hero-subtitle">Grounded. Personalized. Never making it up.</p>

                        <div className="hero-pills">
                            {PILLS.map((p) => (
                                <span key={p.label} className="hero-pill">
                                    <span className="hero-pill-icon">{p.icon}</span>
                                    {p.label}
                                </span>
                            ))}
                        </div>

                        <WeeklySummary />

                        <div className="hero-search-wrap">
                            <SearchBar onSearch={runQuery} loading={loading} />
                        </div>

                        <div className="hero-suggested">
                            {SUGGESTED.map((s) => (
                                <button key={s} className="hero-suggested-chip" onClick={() => runQuery(s)}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hero-body">
                    {error && <p className="hero-error">{error}</p>}

                    {loading && (
                        <div className="hero-loading">
                            <span className="hero-loading-dot" />
                            <span className="hero-loading-dot" />
                            <span className="hero-loading-dot" />
                            FitBot is thinking...
                        </div>
                    )}

                    {result && (
                        <div className="hero-result">
                            <p className="hero-result-answer">{result.answer}</p>

                            {!result.needsClarification && result.recommendedExercises?.length > 0 && (
                                <div className="hero-result-list">
                                    {result.recommendedExercises.map((ex) => (
                                        <div key={ex.id} className="hero-result-card">
                                            <h3>{ex.name}</h3>
                                            <p className="hero-result-meta">
                                                {ex.category} &middot; {ex.equipment} &middot; {ex.level}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {planResult && (
                        <div className="hero-result">
                            <p className="hero-plan-meta">{planResult.days}-day plan{planResult.equipmentFilter ? ' · bodyweight/home-friendly' : ''}</p>
                            {planResult.plan.map((day) => (
                                <PlanDayCard
                                    key={day.day}
                                    dayNumber={day.day}
                                    focus={day.focus}
                                    warmup={day.warmup}
                                    exercises={day.exercises}
                                />
                            ))}

                            <div className="hero-save-split">
                                {!showSaveForm && !saveMessage && (
                                    <button className="hero-save-split-btn" onClick={() => setShowSaveForm(true)}>
                                        Save as a new workout split
                                    </button>
                                )}

                                {showSaveForm && (
                                    <div className="hero-save-split-form">
                                        <input
                                            type="text"
                                            value={splitName}
                                            onChange={(e) => setSplitName(e.target.value)}
                                            placeholder="Name this split"
                                            className="hero-save-split-input"
                                        />
                                        <button
                                            className="hero-save-split-btn"
                                            onClick={saveSplit}
                                            disabled={savingSplit || !splitName.trim()}
                                        >
                                            {savingSplit ? 'Saving...' : 'Save'}
                                        </button>
                                        <button
                                            className="hero-save-split-cancel"
                                            onClick={() => setShowSaveForm(false)}
                                            disabled={savingSplit}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {saveMessage && <p className="hero-save-split-message">{saveMessage}</p>}
                            </div>
                        </div>
                    )}
                    {!result && !planResult && !loading && (
                        <section className="hero-why">
                            <h2>Why <span>FitBot</span></h2>
                            <div className="hero-why-grid">
                                {WHY.map((w) => (
                                    <div key={w.title} className="hero-why-card">
                                        <h3>{w.title}</h3>
                                        <p>{w.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </Layout>
    );
}
