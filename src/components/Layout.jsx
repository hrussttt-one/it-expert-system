import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout({ children }) {
    const { t } = useTranslation();
    const { signOut, profile } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isAdmin = profile?.role === 'admin';

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <>
            <header className="header">
                <div className="header-inner">
                    <NavLink to="/" className="header-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                        IT Expert
                    </NavLink>

                    <button
                        className="hamburger-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {mobileMenuOpen ? (
                                <>
                                    <line x1="4" y1="4" x2="16" y2="16" />
                                    <line x1="16" y1="4" x2="4" y2="16" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="5" x2="17" y2="5" />
                                    <line x1="3" y1="10" x2="17" y2="10" />
                                    <line x1="3" y1="15" x2="17" y2="15" />
                                </>
                            )}
                        </svg>
                    </button>

                    <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <NavLink
                            to="/projects/new"
                            className="add-project-btn"
                            title={t('dashboard.newProject')}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="8" y1="3" x2="8" y2="13" />
                                <line x1="3" y1="8" x2="13" y2="8" />
                            </svg>
                        </NavLink>
                        <NavLink to="/" end onClick={() => setMobileMenuOpen(false)}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: '-2px' }}>
                                <path d="M2 6l6-4 6 4v7a1 1 0 01-1 1H3a1 1 0 01-1-1V6z" />
                                <path d="M6 14V8h4v6" />
                            </svg>
                            {t('nav.dashboard')}
                        </NavLink>
                        <NavLink to="/knowledge" onClick={() => setMobileMenuOpen(false)}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: '-2px' }}>
                                <path d="M2 2h4l2 2h6v9a1 1 0 01-1 1H3a1 1 0 01-1-1V2z" />
                            </svg>
                            {t('nav.knowledge')}
                        </NavLink>
                        {isAdmin && (
                            <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: '-2px' }}>
                                    <circle cx="8" cy="8" r="3" />
                                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
                                </svg>
                                {t('nav.admin')}
                            </NavLink>
                        )}
                        <button onClick={handleLogout} className="logout-btn">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: '-2px' }}>
                                <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3" />
                                <path d="M10 11l3-3-3-3" />
                                <path d="M13 8H6" />
                            </svg>
                            {t('nav.logout')}
                        </button>
                        <LanguageSwitcher />
                        <NavLink to="/guide" className="guide-btn" title={t('nav.guide')} onClick={() => setMobileMenuOpen(false)}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="8" cy="8" r="7" />
                                <path d="M6 6a2 2 0 114 0c0 1-1.5 1.5-1.5 2.5" />
                                <circle cx="8.5" cy="11.5" r="0.5" fill="currentColor" />
                            </svg>
                        </NavLink>
                    </nav>
                </div>
            </header>
            <main className="main-content">
                {children || <Outlet />}
            </main>
        </>
    );
}
