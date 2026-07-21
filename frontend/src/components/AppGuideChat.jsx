import { useState, useRef, useEffect } from 'react';
import api from '../api/api';
import './AppGuideChat.css';

const WELCOME_MESSAGE = {
    role: 'assistant',
    text: "Hi! I'm here to help you get the most out of the app. Ask me things like \"how do I log a workout\" or \"where do I get a workout plan\"."
};

export default function AppGuideChat() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([WELCOME_MESSAGE]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || loading) return;

        setMessages((prev) => [...prev, { role: 'user', text: question }]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai/app-guide', { question });
            setMessages((prev) => [...prev, { role: 'assistant', text: res.data.answer }]);
        } catch (err) {
            setMessages((prev) => [...prev, {
                role: 'assistant',
                text: "Sorry, I couldn't reach the help assistant just now. Please try again in a moment."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-guide-chat">
            {open && (
                <div className="app-guide-chat-panel">
                    <div className="app-guide-chat-header">
                        <span>App Guide</span>
                        <button
                            type="button"
                            className="app-guide-chat-close"
                            onClick={() => setOpen(false)}
                            aria-label="Close help chat"
                        >
                            ×
                        </button>
                    </div>

                    <div className="app-guide-chat-messages" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`app-guide-chat-bubble app-guide-chat-bubble-${m.role}`}>
                                {m.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="app-guide-chat-bubble app-guide-chat-bubble-assistant app-guide-chat-typing">
                                Thinking…
                            </div>
                        )}
                    </div>

                    <form className="app-guide-chat-input-row" onSubmit={handleSend}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask how to use the app…"
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading || !input.trim()}>
                            Send
                        </button>
                    </form>
                </div>
            )}

            <button
                type="button"
                className="app-guide-chat-fab"
                onClick={() => setOpen((o) => !o)}
                aria-label="Open app guide chat"
            >
                {open ? '×' : '?'}
            </button>
        </div>
    );
}