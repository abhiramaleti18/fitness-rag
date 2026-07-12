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
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selected, setSelected] = useState(null);

    const [addTarget, setAddTarget] = useState(null);
    const [splits, setSplits] = useState([]);
    const [loadingSplits, setLoadingSplits] = useState(false);
    const [chosenSplitId, setChosenSplitId] = useState('');
    const [chosenDayNumber, setChosenDayNumber] = useState('');
    const [addSets, setAddSets] = useState('');
    const [addReps, setAddReps] = useState('');
    const [addRest, setAddRest] = useState('');
    const [addSaving, setAddSaving] = useState(false);
    const [addError, setAddError] = useState('');
    const [addSuccess, setAddSuccess] = useState('');

    const openAddToSplit = async (ex) => {
        setAddTarget(ex);
        setAddError('');
        setAddSuccess('');
        setChosenSplitId('');
        setChosenDayNumber('');
        setAddSets('');
        setAddReps('');
        setAddRest('');
        setLoadingSplits(true);
        try {
            const res = await api.get('/splits');
            setSplits(res.data.splits || []);
        } catch (err) {
            setAddError('Failed to load your splits.');
        } finally {
            setLoadingSplits(false);
        }
    };

    const closeAddToSplit = () => setAddTarget(null);

    const handleAddToSplit = async () => {
        if (!chosenSplitId || !chosenDayNumber) return;
        setAddSaving(true);
        setAddError('');

        const split = splits.find(s => s._id === chosenSplitId);
        const updatedDays = split.days.map(d => {
            if (d.dayNumber !== Number(chosenDayNumber)) return d;
            return {
                ...d,
                exercises: [
                    ...d.exercises,
                    {
                        exerciseName: addTarget.name,
                        prescription: { sets: addSets, reps: addReps, rest: addRest },
                        howItWorks: '',
                        movementPattern: addTarget.movementPattern || ''
                    }
                ]
            };
        });

        try {
            await api.put(`/splits/${chosenSplitId}`, { days: updatedDays });
            setAddSuccess(`Added to "${split.name}"!`);
        } catch (err) {
            setAddError('Failed to add exercise. Try again.');
        } finally {
            setAddSaving(false);
        }
    };

    const load = useCallback(async (currentSkip, currentLevel, currentSearch) => {
        setLoading(true);
        setError('');
        try {
            const params = { limit: PAGE_SIZE, skip: currentSkip };
            if (currentLevel) params.level = currentLevel;
            if (currentSearch.trim()) params.name = currentSearch.trim();

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
        const timer = setTimeout(() => {
            load(skip, level, search);
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [skip, level, search]);

    const handleLevelChange = (newLevel) => {
        setLevel(newLevel);
        setSkip(0);
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        setSkip(0);
    };

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.floor(skip / PAGE_SIZE) + 1;

    return (
        <Layout>
            <div className="ex-page">
                <h1 className="ex-title">Exercise Library</h1>
                <p className="ex-sub">{total ? `${total} exercises` : 'Browse the knowledge base'} FitBot draws from.</p>

                <input
                    type="text"
                    className="ex-search-input"
                    placeholder="Search exercises by name..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                />

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
                                <div
                                    key={ex.id}
                                    className="ex-card"
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelected(ex)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') setSelected(ex); }}
                                >
                                    <h3>{ex.name}</h3>
                                    <p className="ex-card-meta">{ex.category} &middot; {ex.equipment}</p>
                                    <span className={`ex-level-badge ex-level-${ex.level}`}>{ex.level}</span>
                                    <button
                                        className="ex-card-add-btn"
                                        onClick={(e) => { e.stopPropagation(); openAddToSplit(ex); }}
                                    >
                                        + Add to Split
                                    </button>
                                </div>
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

                {addTarget && (
                    <div className="ex-modal-backdrop" onClick={closeAddToSplit}>
                        <div className="ex-modal ex-add-modal" onClick={(e) => e.stopPropagation()}>
                            <button className="ex-modal-close" onClick={closeAddToSplit}>&times;</button>
                            <h2>Add "{addTarget.name}" to a split</h2>

                            {loadingSplits && <p className="ex-add-status">Loading your splits...</p>}

                            {!loadingSplits && splits.length === 0 && (
                                <p className="ex-add-status">
                                    You don't have any saved splits yet. Save one from a FitBot plan or
                                    create a custom split first.
                                </p>
                            )}

                            {!loadingSplits && splits.length > 0 && !addSuccess && (
                                <>
                                    <div className="ex-add-field">
                                        <label>Split</label>
                                        <select
                                            value={chosenSplitId}
                                            onChange={(e) => { setChosenSplitId(e.target.value); setChosenDayNumber(''); }}
                                        >
                                            <option value="">Select a split...</option>
                                            {splits.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    {chosenSplitId && (
                                        <div className="ex-add-field">
                                            <label>Day</label>
                                            <select value={chosenDayNumber} onChange={(e) => setChosenDayNumber(e.target.value)}>
                                                <option value="">Select a day...</option>
                                                {splits.find(s => s._id === chosenSplitId)?.days.map(d => (
                                                    <option key={d.dayNumber} value={d.dayNumber}>
                                                        Day {d.dayNumber} — {d.focus}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="ex-add-row">
                                        <input type="text" placeholder="Sets" value={addSets} onChange={(e) => setAddSets(e.target.value)} />
                                        <input type="text" placeholder="Reps" value={addReps} onChange={(e) => setAddReps(e.target.value)} />
                                        <input type="text" placeholder="Rest" value={addRest} onChange={(e) => setAddRest(e.target.value)} />
                                    </div>

                                    {addError && <p className="ex-add-error">{addError}</p>}

                                    <button
                                        className="ex-add-submit"
                                        onClick={handleAddToSplit}
                                        disabled={!chosenSplitId || !chosenDayNumber || addSaving}
                                    >
                                        {addSaving ? 'Adding...' : 'Add to Split'}
                                    </button>
                                </>
                            )}

                            {addSuccess && (
                                <div className="ex-add-success">
                                    <p>{addSuccess}</p>
                                    <button className="ex-add-submit" onClick={closeAddToSplit}>Done</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}