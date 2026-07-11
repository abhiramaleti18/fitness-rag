import { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import './ExerciseSearchInput.css';

export default function ExerciseSearchInput({ onSelect, placeholder = 'Search exercises...' }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!query.trim()) {
            setResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await api.get('/ai/exercises', { params: { name: query.trim(), limit: 8 } });
                setResults(res.data.results || []);
                setOpen(true);
            } catch (err) {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(debounceRef.current);
    }, [query]);

    const handleSelect = (exercise) => {
        onSelect(exercise);
        setQuery('');
        setResults([]);
        setOpen(false);
    };

    return (
        <div className="exsearch-wrapper" ref={wrapperRef}>
            <input
                type="text"
                className="exsearch-input"
                value={query}
                placeholder={placeholder}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
            />

            {open && (
                <div className="exsearch-dropdown">
                    {loading && <div className="exsearch-loading">Searching...</div>}
                    {!loading && results.length === 0 && (
                        <div className="exsearch-empty">No matches. Try a different name.</div>
                    )}
                    {!loading && results.map((ex) => (
                        <button
                            key={ex.id}
                            type="button"
                            className="exsearch-item"
                            onClick={() => handleSelect(ex)}
                        >
                            <span className="exsearch-item-name">{ex.name}</span>
                            <span className="exsearch-item-meta">{ex.category} &middot; {ex.equipment}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}