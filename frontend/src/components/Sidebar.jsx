import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import './Sidebar.css';

const NAV_ITEMS = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/exercises', label: 'Exercises', icon: DumbbellIcon },
    { to: '/splits', label: 'My Workout Splits', icon: SplitIcon },
    { to: '/logs', label: 'My Workouts', icon: LogIcon },
    { to: '/profile', label: 'Profile', icon: UserIcon },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { collapsed, toggle } = useSidebar();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <>
            <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
                <div className="sidebar-top">
                    <Link to="/" className="sidebar-brand">
                        fit<span>bot</span>
                    </Link>
                    <button className="sidebar-toggle" onClick={toggle} aria-label="Close sidebar">
                        <CollapseIcon />
                    </button>
                </div>

                <p className="sidebar-tagline">Your AI Fitness Coach</p>
                <p className="sidebar-desc">
                    FitBot is your intelligent fitness companion. Get personalized exercise guidance,
                    expert coaching cues, and instant answers to your fitness questions.
                </p>

                <div className="sidebar-divider" />

                <span className="sidebar-section-label">Pages &amp; Navigation</span>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                        <Link
                            key={label}
                            to={to}
                            className={`sidebar-link ${location.pathname === to ? 'sidebar-link-active' : ''}`}
                        >
                            <Icon />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {user && <div className="sidebar-user">Training as {user.name}</div>}
                    <button onClick={handleLogout} className="sidebar-link sidebar-logout">
                        <LogoutIcon />
                        Log out
                    </button>
                </div>
            </aside>

            {collapsed && (
                <button className="sidebar-reopen" onClick={toggle} aria-label="Open sidebar">
                    <ExpandIcon />
                </button>
            )}

            <nav className="mobile-tabbar">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <Link
                        key={label}
                        to={to}
                        className={`mobile-tabbar-link ${location.pathname === to ? 'mobile-tabbar-link-active' : ''}`}
                    >
                        <Icon />
                        <span>{label === 'My Workout Splits' ? 'Splits' : label}</span>
                    </Link>
                ))}
            </nav>
        </>
    );
}

function HomeIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 11l9-8 9 8M5 10v10h14V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function DumbbellIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 8v8M18 8v8M2 10v4M22 10v4M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SplitIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4v6a2 2 0 002 2h6M20 4v6a2 2 0 01-2 2h-6M12 12v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function UserIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" /><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function LogoutIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function CollapseIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ExpandIcon() {
    return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function LogIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}