import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import api from '../api/api';
import './Exercises.css';

const LEVELS = ['beginner', 'intermediate', 'expert'];
const PAGE_SIZE = 24;

function formatLabel(str) {
    return str
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Exercises() {
    const [exercises, setExercises] = useState([]);
    const [total, setTotal] = useState(0);
    const [skip, setSkip] = useState(0);
    const [level, setLevel] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);

    const load = useCallback(async (currentSkip, currentLevel) => {
        setLoading(true);
        setError('');
        try {
            const params = { limit: PAGE_SIZE, skip: currentSkip };
            if (currentLevel) params.level = currentLevel;

            const res = await api.get('/ai/exercises', { params });
            setExercises(res.data.results || []);
            setTotal(res.data.total || 0);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load exercises');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load(skip, level);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, level]);

    const handleLevelChange = (newLevel) => {
        setLevel(newLevel);
        setSkip(0);
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

    return (
        <Layout>
            <div className="ex-page">
                <h1 className="ex-title">Exercise Library</h1>
                <p className="ex-sub">{total ? `${total} exercises` : 'Browse the knowledge base'} FitBot draws from.</p>

                <div className="ex-filters">
                    <button className={`ex-filter-chip ${level === '' ? 'ex-filter-active' : ''}`} onClick={() => handleLevelChange('')}>
                        All levels
                    </button>
                    {LEVELS.map(l => (
                        <button
                            key={l}
                            className={`ex-filter-chip ${level === l ? 'ex-filter-active' : ''}`}
                            onClick={() => handleLevelChange(l)}
                        >
                            {l}
                        </button>
                    ))}
                </div>

                {error && <p className="ex-error">{error}</p>}

                {loading ? (
                    <div className="ex-loading">Loading exercises...</div>
                ) : (
                    <>
                        <div className="ex-grid">
                            {exercises.map((ex) => (
                                <button key={ex.id} className="ex-card" onClick={() => setSelected(ex)}>
                                    <h3>{ex.name}</h3>
                                    <p className="ex-card-meta">{ex.category} &middot; {ex.equipment}</p>
                                    <span className={`ex-level-badge ex-level-${ex.level}`}>{ex.level}</span>
                                </button>
                            ))}
                        </div>

                        {exercises.length === 0 && !error && (
                            <p className="ex-empty">No exercises found for this filter.</p>
                        )}

                        <div className="ex-pagination">
                            <button disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}>
                                Previous
                            </button>
                            <span>Page {currentPage} of {totalPages}</span>
                            <button disabled={currentPage >= totalPages} onClick={() => setSkip(skip + PAGE_SIZE)}>
                                Next
                            </button>
                        </div>
                    </>
                )}

                {selected && (
                    <div className="ex-modal-backdrop" onClick={() => setSelected(null)}>
                        <div className="ex-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="ex-modal-close" onClick={() => setSelected(null)}>&times;</button>
                            <h2>{selected.name}</h2>
                            <p className="ex-modal-meta">
                                {selected.category} &middot; {selected.equipment} &middot; {selected.level}
                            </p>

                            {selected.primaryMuscles?.length > 0 && (
                                <div className="ex-modal-section">
                                    <h4>Primary Muscles</h4>
                                    <p>{selected.primaryMuscles.join(', ')}</p>
                                </div>
                            )}

                            {selected.coachingCues?.length > 0 && (
                                <div className="ex-modal-section">
                                    <h4>Coaching Cues</h4>
                                    <ul>{selected.coachingCues.map((c, i) => <li key={i}>{c}</li>)}</ul>
                                </div>
                            )}

                            {selected.commonMistakes?.length > 0 && (
                                <div className="ex-modal-section">
                                    <h4>Common Mistakes</h4>
                                    <ul>{selected.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}</ul>
                                </div>
                            )}

                            {selected.contraindications?.length > 0 && (
                            <div className="ex-modal-section ex-modal-warning">
                                <h4>Contraindications</h4>
                                <p>{selected.contraindications.map(formatLabel).join(', ')}</p>
                            </div>
                        )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}