import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Layout({ children }) {
    const { t } = useTranslation();
    const { signOut, isAdmin } = useAuth();
    const navigate = useNavigate();

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
                    <nav className="header-nav">
                        <NavLink to="/">{t('nav.dashboard')}</NavLink>
                        <NavLink to="/projects/new">{t('nav.newProject')}</NavLink>
                        {isAdmin && <NavLink to="/admin">{t('nav.admin')}</NavLink>}
                        <LanguageSwitcher />
                        <button onClick={handleLogout}>{t('nav.logout')}</button>
                    </nav>
                </div>
            </header>
            <main className="main-content">
                {children}
            </main>
        </>
    );
}
