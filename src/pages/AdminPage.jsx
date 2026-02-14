import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';

export default function AdminPage() {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '', role: 'user' });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [createdCredentials, setCreatedCredentials] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
        setUsers(data || []);
        setLoading(false);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        // Create a temporary client to avoid logging out the admin
        // We MUST use a custom storage to prevent overwriting the main client's session in localStorage
        const tempClient = createClient(
            import.meta.env.VITE_SUPABASE_URL,
            import.meta.env.VITE_SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                    storage: {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { },
                    }
                }
            }
        );

        // Sign up the user via temp client
        const { data, error: authError } = await tempClient.auth.signUp({
            email: newUser.email,
            password: newUser.password,
            options: {
                data: {
                    full_name: newUser.full_name,
                    role: newUser.role,
                },
            },
        });

        if (authError) {
            setError(authError.message);
            setSaving(false);
            return;
        }

        // Update profile role manually if needed (although trigger might handle it, we want to be sure)
        if (data?.user) {
            await supabase
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    email: newUser.email,
                    full_name: newUser.full_name,
                    role: newUser.role,
                });
        }

        // Show credentials modal
        setCreatedCredentials({
            email: newUser.email,
            password: newUser.password
        });

        setShowModal(false);
        setNewUser({ email: '', password: '', full_name: '', role: 'user' });
        setSaving(false);
        fetchUsers();
    };

    const copyToClipboard = () => {
        const text = `Email: ${createdCredentials.email}\nPassword: ${createdCredentials.password}`;
        navigator.clipboard.writeText(text);
        alert(t('admin.copied'));
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Layout>
            <div className="page-header">
                <div className="toolbar">
                    <div>
                        <h1>{t('admin.title')}</h1>
                        <p>{t('admin.subtitle')}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="8" y1="3" x2="8" y2="13" />
                            <line x1="3" y1="8" x2="13" y2="8" />
                        </svg>
                        {t('admin.addUser')}
                    </button>
                </div>
            </div>

            <div className="card">
                {loading ? (
                    <div className="loading-inline"><div className="loading-spinner" /></div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin.email')}</th>
                                <th>{t('admin.name')}</th>
                                <th>{t('admin.role')}</th>
                                <th>{t('admin.created')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.email}</td>
                                    <td>{user.full_name || '—'}</td>
                                    <td>
                                        <span className={`role-badge ${user.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                                            {user.role === 'admin' ? t('admin.roleAdmin') : t('admin.roleUser')}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{t('admin.addUserTitle')}</h2>
                        {error && <div className="login-error">{error}</div>}
                        <form onSubmit={handleAddUser}>
                            <div className="form-group">
                                <label className="form-label">{t('admin.email')}</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('admin.password')}</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('admin.name')}</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newUser.full_name}
                                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{t('admin.role')}</label>
                                <select
                                    className="form-select"
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="user">{t('admin.roleUser')}</option>
                                    <option value="admin">{t('admin.roleAdmin')}</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    {t('admin.cancel')}
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? t('common.loading') : t('admin.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Credentials Modal */}
            {createdCredentials && (
                <div className="modal-overlay">
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{t('admin.credentialsTitle')}</h2>
                        <p style={{ marginBottom: '1rem', color: '#666' }}>
                            {t('admin.credentialsSubtitle')}
                        </p>

                        <div className="credentials-box" style={{ background: '#f5f5f7', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>{t('admin.email')}:</strong> {createdCredentials.email}
                            </div>
                            <div>
                                <strong>{t('admin.password')}:</strong> {createdCredentials.password}
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-primary" onClick={copyToClipboard}>
                                {t('admin.copy')}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setCreatedCredentials(null)}>
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
