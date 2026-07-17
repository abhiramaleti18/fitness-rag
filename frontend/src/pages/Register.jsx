import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import './Auth.css';

const GOALS = ['muscle gain', 'strength', 'fat loss', 'endurance', 'mobility'];
const EQUIPMENT = ['bodyweight', 'dumbbells', 'barbell', 'resistance bands', 'full gym'];

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', password: '', experienceLevel: 'beginner'
    });
    const [goals, setGoals] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const toggle = (list, setList, item) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/register', {
                ...form,
                fitnessGoals: goals,
                equipmentAccess: equipment
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('loginTime', Date.now().toString());
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-ambient" />
            <div className="auth-card auth-card-wide">
                <Link to="/" className="auth-brand">FIT<span>BOT</span></Link>

                <h1>Create your account</h1>
                <p className="auth-sub">Tell us a bit about your training so recommendations fit.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" value={form.name} onChange={handleChange} required />

                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />

                    <label htmlFor="experienceLevel">Experience level</label>
                    <select id="experienceLevel" name="experienceLevel" value={form.experienceLevel} onChange={handleChange}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>

                    <label>Goals</label>
                    <div className="chip-group">
                        {GOALS.map(g => (
                            <button
                                type="button"
                                key={g}
                                className={`chip ${goals.includes(g) ? 'chip-active' : ''}`}
                                onClick={() => toggle(goals, setGoals, g)}
                            >
                                {g}
                            </button>
                        ))}
                    </div>

                    <label>Equipment access</label>
                    <div className="chip-group">
                        {EQUIPMENT.map(e => (
                            <button
                                type="button"
                                key={e}
                                className={`chip ${equipment.includes(e) ? 'chip-active' : ''}`}
                                onClick={() => toggle(equipment, setEquipment, e)}
                            >
                                {e}
                            </button>
                        ))}
                    </div>

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already training with us? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}
