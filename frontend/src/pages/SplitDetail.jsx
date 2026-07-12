import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import PlanDayCard from '../components/PlanDayCard';
import ExerciseSearchInput from '../components/ExerciseSearchInput';
import api from '../api/api';
import './SplitDetail.css';

export default function SplitDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [split, setSplit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [swapTarget, setSwapTarget] = useState(null); // { dayIndex, exIndex }
    const [swapping, setSwapping] = useState(false);

    useEffect(() => {
        api.get(`/splits/${id}`)
            .then(res => setSplit(res.data.split))
            .catch(() => setError('Split not found.'))
            .finally(() => setLoading(false));
    }, [id]);
    const handleSwap = async (dayIndex, exIndex, newExercise) => {
        setSwapping(true);

        const updatedDays = split.days.map((d, di) => {
            if (di !== dayIndex) return d;
            return {
                ...d,
                exercises: d.exercises.map((ex, ei) => {
                    if (ei !== exIndex) return ex;
                    return {
                        ...ex,
                        exerciseName: newExercise.name,
                        movementPattern: newExercise.movementPattern || ex.movementPattern
                    };
                })
            };
        });

        try {
            const res = await api.put(`/splits/${id}`, { days: updatedDays });
            setSplit(res.data.split);
        } catch (err) {
            console.error('Failed to swap exercise', err);
        } finally {
            setSwapTarget(null);
            setSwapping(false);
        }
    };
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

                {split.days.map((day, dayIndex) => (
                    <div key={day.dayNumber} className="split-detail-day">
                        <PlanDayCard
                            dayNumber={day.dayNumber}
                            focus={day.focus}
                            warmup={day.warmup}
                            exercises={day.exercises}
                            onSwapExercise={(exIndex) => setSwapTarget({ dayIndex, exIndex })}
                        />

                        {swapTarget?.dayIndex === dayIndex && (
                            <div className="split-detail-swap-box">
                                <p className="split-detail-swap-label">
                                    Replace "{day.exercises[swapTarget.exIndex].exerciseName}" with:
                                </p>
                                <div className="split-detail-swap-input-row">
                                    <ExerciseSearchInput
                                        placeholder="Search for a replacement exercise..."
                                        onSelect={(exercise) => handleSwap(dayIndex, swapTarget.exIndex, exercise)}
                                    />
                                    <button
                                        className="split-detail-swap-cancel"
                                        onClick={() => setSwapTarget(null)}
                                        disabled={swapping}
                                    >
                                        Cancel
                                    </button>
                                </div>
                                {swapping && <p className="split-detail-swap-status">Swapping...</p>}
                            </div>
                        )}

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