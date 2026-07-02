import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WordmarkReveal from '../components/WordmarkReveal';
import SearchBar from '../components/SearchBar';
import api from '../api/api';
import './Hero.css';

export default function Hero() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleSearch = async (query) => {
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="hero-page">
            <div className="hero-glow-top" />

            <nav className="hero-nav">
                <span className="hero-nav-brand">FIT<span>BOT</span></span>
                {user ? (
                    <div className="hero-nav-actions">
                        <span className="hero-nav-user">Hi, {user.name}</span>
                        <button onClick={handleLogout} className="hero-nav-link">Log out</button>
                    </div>
                ) : (
                    <div className="hero-nav-actions">
                        <Link to="/login" className="hero-nav-link">Log in</Link>
                        <Link to="/register" className="hero-nav-cta">Get started</Link>
                    </div>
                )}
            </nav>

            <main className="hero-main">
                <WordmarkReveal />

                <div className="hero-image-wrap">
                    {/* Replace src below with your uploaded image path once added to /src/assets */}
                    <img
                        src="/hero-placeholder.jpg"
                        alt="Athlete training"
                        className="hero-image"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>

                <p className="hero-tagline">
                    Grounded exercise guidance.
                </p>

                <div className="hero-search-wrap">
                    <SearchBar onSearch={handleSearch} loading={loading} />
                </div>

                {error && <p className="hero-error">{error}</p>}

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
            </main>
        </div>
    );
}
