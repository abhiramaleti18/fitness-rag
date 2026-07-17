import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';
import './Auth.css';

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
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
            <div className="auth-card">
                <Link to="/" className="auth-brand">FIT<span>BOT</span></Link>

                <h1>Welcome back</h1>
                <p className="auth-sub">Log in to keep training with FitBot.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <label htmlFor="email">Email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />

                    <label htmlFor="password">Password</label>
                    <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />

                    <button type="submit" className="auth-submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <p className="auth-switch">
                    New here? <Link to="/register">Create an account</Link>
                </p>
            </div>
        </div>
    );
}
