import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SearchBar from '../components/SearchBar';
import api from '../api/api';
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

export default function Hero() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const runQuery = async (query) => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const res = await api.post('/ai/recommend', { query, top_k: 5 });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
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

                            {result.recommendedExercises?.length > 0 && (
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

                    {!result && !loading && (
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
