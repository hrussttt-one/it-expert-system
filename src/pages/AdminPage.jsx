import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

        // Sign up the user via Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
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

        // Update profile role
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

        setShowModal(false);
        setNewUser({ email: '', password: '', full_name: '', role: 'user' });
        setSaving(false);
        fetchUsers();
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
        </Layout>
    );
}
