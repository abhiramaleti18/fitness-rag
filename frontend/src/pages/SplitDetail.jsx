import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PlanDayCard from '../components/PlanDayCard';
import api from '../api/api';
import './SplitDetail.css';

export default function SplitDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [split, setSplit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/splits/${id}`)
            .then(res => setSplit(res.data.split))
            .catch(() => setError('Split not found.'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="split-detail-page"><p className="split-detail-loading">Loading...</p></div>
            </Layout>
        );
    }

    if (error || !split) {
        return (
            <Layout>
                <div className="split-detail-page">
                    <p className="split-detail-error">{error || 'Something went wrong.'}</p>
                    <Link to="/splits" className="split-detail-back">Back to My Workout Splits</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="split-detail-page">
                <Link to="/splits" className="split-detail-back">&larr; My Workout Splits</Link>

                <div className="split-detail-header">
                    <h1>{split.name}</h1>
                    <p className="split-detail-meta">
                        {split.days.length} day{split.days.length !== 1 ? 's' : ''}
                        {split.isCustom ? ' · custom' : ' · AI-generated'}
                        {split.sourceQuery ? ` · from "${split.sourceQuery}"` : ''}
                    </p>
                </div>

                {split.aiReport?.text && (
                    <div className="split-detail-report">
                        <h2>FitBot's Analysis</h2>
                        <p>{split.aiReport.text}</p>
                    </div>
                )}

                {split.days.map((day) => (
                    <div key={day.dayNumber} className="split-detail-day">
                        <PlanDayCard
                            dayNumber={day.dayNumber}
                            focus={day.focus}
                            warmup={day.warmup}
                            exercises={day.exercises}
                        />
                        <button
                            className="split-detail-log-btn"
                            onClick={() => navigate('/logs', {
                                state: {
                                    dayLabel: day.focus,
                                    exercises: day.exercises.map(ex => ({
                                        exerciseName: ex.exerciseName,
                                        prescription: ex.prescription
                                    }))
                                }
                            })}
                        >
                            Log this workout
                        </button>
                    </div>
                ))}
            </div>
        </Layout>
    );
}