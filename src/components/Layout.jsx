import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout({ children }) {
    const { t } = useTranslation();
    const { signOut, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                        ExpertPM
                    </NavLink>

                    {/* Mobile hamburger */}
                    <button
                        className="hamburger-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            {mobileMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>

                    <nav className={`header-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                        <NavLink to="/projects/new" className="add-project-btn" title={t('nav.newProject')}>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="10" y1="4" x2="10" y2="16" />
                                <line x1="4" y1="10" x2="16" y2="10" />
                            </svg>
                        </NavLink>
                        <NavLink to="/">{t('nav.dashboard')}</NavLink>
                        <NavLink to="/knowledge">{t('nav.knowledge')}</NavLink>
                        {isAdmin && <NavLink to="/admin">{t('nav.admin')}</NavLink>}
                        <button onClick={handleLogout} className="logout-btn">{t('nav.logout')}</button>
                        <LanguageSwitcher />
                    </nav>
                </div>
            </header>
            <main className="main-content">
                {children}
            </main>
        </>
    );
}
