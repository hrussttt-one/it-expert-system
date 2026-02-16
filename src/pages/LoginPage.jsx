import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginPage() {
    const { t } = useTranslation();
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(t('auth.error'));
            setLoading(false);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card animate-in">
                <div style={{ position: 'absolute', top: 24, right: 24 }}>
                    <LanguageSwitcher />
                </div>
                <svg className="login-logo" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M24 4L4 14l20 10 20-10L24 4z" />
                    <path d="M4 34l20 10 20-10" />
                    <path d="M4 24l20 10 20-10" />
                </svg>
                <h1>{t('auth.title')}</h1>
                <p>{t('auth.subtitle')}</p>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <rect x="2" y="3" width="12" height="10" rx="2" />
                                <path d="M2 5l6 4 6-4" />
                            </svg>
                            {t('auth.email')}
                        </label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                <rect x="3" y="7" width="10" height="7" rx="2" />
                                <path d="M5 7V5a3 3 0 016 0v2" />
                            </svg>
                            {t('auth.password')}
                        </label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <>
                                <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                                {t('auth.loading')}
                            </>
                        ) : t('auth.login')}
                    </button>
                </form>
            </div>
        </div>
    );
}
