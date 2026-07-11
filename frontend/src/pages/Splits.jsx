import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ConfirmModal from '../components/ConfirmModal';
import api from '../api/api';
import './Splits.css';

export default function Splits() {
    const navigate = useNavigate();
    const [splits, setSplits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pendingDelete, setPendingDelete] = useState(null);

    const loadSplits = async () => {
        try {
            const res = await api.get('/splits');
            setSplits(res.data.splits);
        } catch (err) {
            setError('Failed to load your workout splits.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadSplits(); }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        try {
            await api.delete(`/splits/${pendingDelete.id}`);
            setSplits(splits.filter(s => s._id !== pendingDelete.id));
        } catch (err) {
            console.error('Failed to delete split', err);
        } finally {
            setPendingDelete(null);
        }
    };

    return (
        <Layout>
            <div className="splits-page">
                <div className="splits-header">
                    <h1>My Workout Splits</h1>
                    <p className="splits-sub">Splits you've saved from FitBot, ready to log against.</p>
                </div>

                {loading && <p className="splits-loading">Loading...</p>}
                {error && <p className="splits-error">{error}</p>}

                {!loading && splits.length === 0 && (
                    <div className="splits-empty">
                        <p>No saved splits yet.</p>
                        <p className="splits-empty-hint">Ask FitBot for a workout split (e.g. "push pull legs split"), then hit "Save as a new workout split."</p>
                        <button className="splits-empty-btn" onClick={() => navigate('/')}>
                            Ask FitBot
                        </button>
                    </div>
                )}

                <div className="splits-grid">
                    {splits.map((split) => (
                        <div key={split._id} className="splits-card" onClick={() => navigate(`/splits/${split._id}`)}>
                            <div className="splits-card-top">
                                <h3>{split.name}</h3>
                                <button
                                    className="splits-card-delete"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingDelete({ id: split._id, name: split.name });
                                    }}
                                    aria-label="Delete split"
                                >
                                    &times;
                                </button>
                            </div>
                            <p className="splits-card-meta">
                                {split.days.length} day{split.days.length !== 1 ? 's' : ''}
                                {split.isCustom ? ' · custom' : ' · AI-generated'}
                            </p>
                            <div className="splits-card-tags">
                                {split.days.map((d) => (
                                    <span key={d.dayNumber} className="splits-card-tag">{d.focus}</span>
                                ))}
                            </div>
                            <p className="splits-card-date">
                                Saved {new Date(split.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <ConfirmModal
                open={!!pendingDelete}
                title="Delete workout split?"
                message={pendingDelete ? `This will permanently remove "${pendingDelete.name}".` : ''}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
        </Layout>
    );
}