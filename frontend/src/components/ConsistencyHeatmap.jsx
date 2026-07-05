import { useState, useEffect } from 'react';
import api from '../api/api';
import './ConsistencyHeatmap.css';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildWeeks(counts) {
    const today = new Date();
    const days = [];

    for (let i = 370; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        days.push({ date: key, count: counts[key] || 0, month: d.getMonth() });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }
    return weeks;
}

// Figures out which weeks should get a month label above them —
// only the first week where a new month appears gets labeled, to avoid repeats.
function getMonthLabels(weeks) {
    // First, find every month transition point
    const transitions = [];
    let lastMonth = null;

    weeks.forEach((week, index) => {
        const firstDayOfWeek = week[0];
        if (firstDayOfWeek.month !== lastMonth) {
            transitions.push({ weekIndex: index, label: MONTH_NAMES[firstDayOfWeek.month] });
            lastMonth = firstDayOfWeek.month;
        }
    });

    // Only keep a label if its month spans at least 3 weeks before the next one starts
    const labels = transitions.filter((t, i) => {
        const nextIndex = transitions[i + 1]?.weekIndex ?? weeks.length;
        return (nextIndex - t.weekIndex) >= 3;
    });

    return labels;
}

function levelFor(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    return 3;
}

export default function ConsistencyHeatmap() {
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        api.get('/logs/consistency')
            .then(res => {
                setCounts(res.data.counts || {});
                calculateStreak(res.data.counts || {});
            })
            .catch(err => console.error('Failed to load consistency data', err))
            .finally(() => setLoading(false));
    }, []);

    const calculateStreak = (data) => {
        let s = 0;
        const d = new Date();
        while (true) {
            const key = d.toISOString().split('T')[0];
            if (data[key]) {
                s++;
                d.setDate(d.getDate() - 1);
            } else {
                break;
            }
        }
        setStreak(s);
    };

    if (loading) return <div className="heatmap-loading">Loading activity...</div>;

    const weeks = buildWeeks(counts);
    const monthLabels = getMonthLabels(weeks);
    const totalSessions = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <div className="heatmap-card">
            <div className="heatmap-header">
                <h3>Consistency</h3>
                <div className="heatmap-stats">
                    <span>{totalSessions} sessions in the last year</span>
                    {streak > 0 && <span className="heatmap-streak">🔥 {streak} day streak</span>}
                </div>
            </div>

            <div className="heatmap-scroll">
                <div className="heatmap-months">
                    {monthLabels.map((m) => (
                        <span
                            key={m.weekIndex}
                            className="heatmap-month-label"
                            style={{ left: `${m.weekIndex * 14}px` }}
                        >
                            {m.label}
                        </span>
                    ))}
                </div>

                <div className="heatmap-grid">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="heatmap-week">
                            {week.map((day) => (
                                <div
                                    key={day.date}
                                    className={`heatmap-day heatmap-level-${levelFor(day.count)}`}
                                    title={`${day.date}: ${day.count} session${day.count !== 1 ? 's' : ''}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="heatmap-legend">
                <span>Less</span>
                <div className="heatmap-day heatmap-level-0" />
                <div className="heatmap-day heatmap-level-1" />
                <div className="heatmap-day heatmap-level-2" />
                <div className="heatmap-day heatmap-level-3" />
                <span>More</span>
            </div>
        </div>
    );
}