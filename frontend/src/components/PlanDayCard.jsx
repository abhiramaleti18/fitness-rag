import './PlanDayCard.css';

export default function PlanDayCard({ dayNumber, focus, warmup, exercises, onSwapExercise, onRemoveExercise }) {
    return (
        <div className="plan-day-card">
            <h3>Day {dayNumber} — {focus}</h3>

            {warmup && warmup.length > 0 && (
                <div className="plan-day-warmup">
                    <span className="plan-day-warmup-label">Warm-up</span>
                    <div className="plan-day-warmup-list">
                        {warmup.map((w) => (
                            <div key={w.name} className="plan-day-warmup-item">
                                <span className="plan-day-warmup-name">{w.name}</span>
                                <span className="plan-day-warmup-hold">{w.holdTime}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="plan-day-exercise-list">
                {exercises.map((ex, i) => (
                    <div key={ex.id || ex.exerciseName || ex.name || i} className="plan-day-exercise">
                        <div className="plan-day-exercise-header">
                            <h4>{ex.name || ex.exerciseName}</h4>
                            <span className="plan-day-prescription">
                                {ex.prescription?.sets} sets &times; {ex.prescription?.reps} reps
                            </span>
                        </div>
                        <p className="plan-day-how">{ex.howItWorks}</p>
                        {(onSwapExercise || onRemoveExercise) && (
                            <div className="plan-day-edit-actions">
                                {onSwapExercise && (
                                    <button className="plan-day-swap-btn" onClick={() => onSwapExercise(i)}>
                                        Swap exercise
                                    </button>
                                )}
                                {onRemoveExercise && (
                                    <button className="plan-day-remove-btn" onClick={() => onRemoveExercise(i)}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}