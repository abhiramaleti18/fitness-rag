import { useState } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, loading }) {
    const [value, setValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!value.trim() || loading) return;
        onSearch(value.trim());
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <div className="search-bar-glow" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ask for a workout, a movement, or how to fix your form..."
                className="search-bar-input"
                autoFocus
            />
            <button type="submit" className="search-bar-submit" disabled={loading} aria-label="Search">
                {loading ? (
                    <span className="search-bar-spinner" />
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>
        </form>
    );
}
